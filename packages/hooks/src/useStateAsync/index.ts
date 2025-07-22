import { useEffect } from "react";
//
import {
  noop,
  sleep,
  isFunction,
  isEmpty as _isEmpty,
} from "@ygrowly/shared";
//
import { useStateSync } from "../useStateSync";

export interface UseStateAsyncOptions<D = any, S = any> {
  /** 成功监听 */
  onSuccess?: (data: D) => void;
  /** 错误监听 */
  onError?: (e: unknown) => void;
  /** 是否立即执行 */
  immediate?: boolean;
  /** 延迟 ms */
  delay?: number;
  /** 每次执行是否重置状态 */
  resetOnExecute?: boolean;
  /** 出错是否重置状态 */
  resetOnError?: boolean;
  /** 是否抛出错误 */
  throwError?: boolean;
  /** 执错误时最大重试次数 */
  executeCountOnError?: number;
  /** 初始化 数据 */
  initialState?: S;
}

export interface UseStateAsyncReturn<D = any, P extends any[] = any[]> {
  state: D; // 异步数据结果
  getState: () => D;
  setState: (action: D | ((state: D) => D)) => void;

  isLoading: boolean; // 是否正在加载
  getIsLoading: () => boolean;
  setIsLoading: (action: boolean | ((state: boolean) => boolean)) => void;

  isEmpty: boolean; // 	数据是否为空
  getIsEmpty: () => boolean;
  setIsEmpty: (action: boolean | ((state: boolean) => boolean)) => void;

  isReady: boolean; // 是否加载成功
  getIsReady: () => boolean;
  setIsReady: (action: boolean | ((state: boolean) => boolean)) => void;

  error: any;
  getError: () => any;
  setError: (action: any | ((state: any) => any)) => void;

  execute: (...args: P) => Promise<void>; // 执行异步任务
  reset: () => void; // 	重置所有状态
}

/**
 * 异步 state、异步 action
 * @param promise
 * @param options
 */
export function useStateAsync<D = any, P extends any[] = any[]>(
  promise: Promise<D> | ((...args: P) => Promise<D>),
  options?: UseStateAsyncOptions<D, undefined>
): UseStateAsyncReturn<D | undefined, P>;

export function useStateAsync<D = any, P extends any[] = any[]>(
  promise: Promise<D> | ((...args: P) => Promise<D>),
  options?: UseStateAsyncOptions<D, D>
): UseStateAsyncReturn<D, P>;

export function useStateAsync<D = any, P extends any[] = any[]>(
  promise: Promise<D> | ((...args: P) => Promise<D>),
  options: UseStateAsyncOptions<D> = {}
) {
  const {
    onSuccess = noop,
    onError = noop,
    initialState,
    immediate = true,
    delay = 0,
    resetOnExecute = false,
    throwError = true,
    resetOnError = false,
    executeCountOnError = 0,
  } = options;

  // 状态管理
  const [state, setState, getState] = useStateSync(initialState);
  const [isLoading, setIsLoading, getIsLoading] = useStateSync(false);
  const [isReady, setIsReady, getIsReady] = useStateSync(false);
  const [isEmpty, setIsEmpty, getIsEmpty] = useStateSync(false);
  const [error, setError, getError] = useStateSync(null);

  /**
   * 清空状态的函数，可手动调用或自动调用（如出错时）
   */
  const reset = () => {
    setIsEmpty(false);
    setIsReady(false);
    setIsLoading(false);
    setState(initialState);
    setError(null);
  };

  /**
   * 异步请求执行逻辑
   * @param count
   * @param args
   */
  async function executeHandler(count = 1, ...args: P) {
    try {
      const _promise = isFunction(promise) ? promise(...(args as P)) : promise;
      const result: D = await _promise;
      if (delay) await sleep(delay);
      setState(result);
      setIsReady(true);
      setIsLoading(false);
      setIsEmpty(_isEmpty(result));
      onSuccess(result);
    } catch (err) {
      if (executeCountOnError && count <= executeCountOnError) {
        await executeHandler(count + 1, ...args);
      } else {
        onError(err);
        setError(err as any);
        setIsLoading(false);
        if (resetOnError) reset();
        if (throwError) throw err;
      }
    }
  }

  /**
   * 主调函数
   * @param args
   * @returns
   */
  const execute = async (...args: P) => {
    if (getIsLoading()) return;
    if (resetOnExecute) reset();
    setError(null);
    setIsLoading(true);
    await executeHandler(1, ...args);
  };

  /**
   * 支持 immediate 执行
   */
  useEffect(() => {
    if (immediate) {
      const args: P = [] as any;
      execute(...args);
    }
  }, []);

  const result: UseStateAsyncReturn<D | undefined, P> = {
    isLoading,
    setIsLoading,
    getIsLoading,

    isEmpty,
    setIsEmpty,
    getIsEmpty,

    state,
    setState,
    getState,

    error,
    setError,
    getError,

    isReady,
    setIsReady,
    getIsReady,

    execute,
    reset,
  };

  return result;
}
