import { useCallback, useEffect, useRef } from "react";
import { useStateSync } from "../useStateSync";
import { isError } from "@gabriel9x9/shared";

interface UseListOptions<T> {
  /** 是否立即加载第一页数据 (默认: true) */
  immediate?: boolean;
  /** 每页数据量 (默认: 10) */
  pageSize?: number;
  /** 数据缓存策略 (默认: false) */
  cache?: boolean;
  /** 防抖时间 (ms, 默认: 300) */
  debounceTime?: number;
  /** 数据格式化函数 */
  formatter?: (data: T[]) => T[];
}

/**
 * 高性能长列表管理 Hook
 * 支持分页加载、下拉刷新、错误重试、防抖等功能
 * @param promise 数据获取函数
 * @param options 配置选项
 */
export function useList<T = any>(
  promise: (
    page: number,
    pageSize: number
  ) => Promise<{
    count?: number;
    data?: T[];
  }>,
  options: UseListOptions<T> = {}
) {
  // 合并默认配置
  const {
    immediate = true,
    pageSize = 10,
    cache = false,
    debounceTime = 300,
    formatter,
  } = options;

  // 使用 ref 存储可变的变量
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Record<number, T[]>>({});

  /** 总数据量 */
  const [count, setCount, getCount] = useStateSync(0);
  /** 当前页码 (从0开始) */
  const [page, setPage, getPage] = useStateSync(0);
  /** 列表数据 */
  const [data, setData, getData] = useStateSync<T[]>([]);
  /** 加载状态 */
  const [isLoading, setIsLoading, getIsLoading] = useStateSync(false);
  /** 是否已加载第一页 */
  const [isReady, setIsReady] = useStateSync(false);
  /** 列表是否为空 */
  const [isEmpty, setIsEmpty, getIsEmpty] = useStateSync(false);
  /** 是否已加载完所有数据 */
  const [isFinish, setIsFinish, getIsFinish] = useStateSync(false);
  /** 错误信息 */
  const [error, setError, errorRef] = useStateSync<any>(null);
  /** 重试次数 */
  const [retryCount, setRetryCount] = useStateSync(0);

  /**
   * 取消当前请求
   */
  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * 清除防抖定时器
   */
  const clearDebounce = useCallback(() => {
    if (debounceTimeRef.current) {
      clearTimeout(debounceTimeRef.current);
      debounceTimeRef.current = null;
    }
  }, []);

  /**
   * 格式化数据
   */
  const formatData = useCallback(
    (rawData: T[]) => {
      return formatter ? formatter(rawData) : rawData;
    },
    [formatter]
  );

  /**
   * 从缓存获取数据
   */
  const getFromCache = useCallback((pageNum: number) => {
    return cacheRef.current[pageNum] || null;
  }, []);

  /**
   * 设置缓存数据
   */
  const setCache = useCallback(
    (pageNum: number, data: T[]) => {
      if (cache) {
        cacheRef.current[pageNum] = data;
      }
    },
    [cache]
  );

  /**
   * 检查是否可以加载更多
   */
  const canLoadMore = useCallback(() => {
    return !getIsLoading() && !getIsEmpty() && !getIsFinish();
  }, [getIsLoading, getIsEmpty, getIsFinish]);

  /**
   * 核心加载函数
   */
  const loadData = useCallback(async () => {
    if (!canLoadMore) return;

    const currentPage = getPage();
    const cachedData = getFromCache(currentPage);

    // 如果有缓存且不是第一页，直接使用缓存
    if (cachedData && currentPage > 0) {
      setData((prev) => [...prev, ...formatData(cachedData)]);
      return;
    }

    abortRequest(); // 取消之前的请求
    setError(null);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const result = await promise(currentPage, pageSize);

      if (controller.signal.aborted) return;

      const newData = result.data || [];
      const formattedData = formatData(newData);
      const totalCount = result.count || 0;

      setData((prev) =>
        currentPage === 0 ? formattedData : [...prev, ...formattedData]
      );
      setCount(totalCount);
      setCache(currentPage, formattedData);

      setIsEmpty(formattedData.length === 0);
      setIsFinish(
        formattedData.length < pageSize ||
          (totalCount > 0 && getData().length >= totalCount)
      );
      setIsReady(true);
      setRetryCount(0);
    } catch (err) {
      if (isError(err) && err.name != "AbortError") {
        setError(err);
        setPage((prev) => (prev > 0 ? prev - 1 : 0)); // 回滚页码
        throw err;
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [promise, pageSize, canLoadMore]);

  /**
   * 防抖加载
   */
  const debouncedLoad = useCallback(() => {
    clearDebounce();
    debounceTimeRef.current = setTimeout(() => {
      loadData();
    }, debounceTime);
  }, [loadData, debounceTime]);

  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    abortRequest();
    clearDebounce();
    setCount(0);
    setPage(0);
    setData([]);
    setIsLoading(false);
    setIsReady(false);
    setIsEmpty(false);
    setIsFinish(false);
    setError(null);
    setRetryCount(0);
    cacheRef.current = {};
  }, []);

  /**
   * 刷新数据 (重置后重新加载)
   */
  const refresh = useCallback(async () => {
    reset();
    await loadData();
  }, [reset, loadData]);

  /**
   * 重试加载
   */
  const retry = useCallback(async () => {
    if (retryCount < 3) {
      // most three
      setRetryCount((prev) => prev + 1);
      await loadData();
    }
  }, [retryCount, loadData]);

  // 自动初始化
  useEffect(() => {
    if (immediate) {
      refresh();
    }
    return () => {
      abortRequest();
      clearDebounce();
    };
  }, []);

  return {
    // 状态
    count,
    page,
    data,
    isLoading,
    isReady,
    isEmpty,
    isFinish,
    error,
    retryCount,

    // 方法
    loadData: debouncedLoad,
    refresh,
    reset,
    retry,
    abortRequest,

    // 状态设置器
    setCount,
    setPage,
    setData,
    setIsLoading,
    setIsReady,
    setIsEmpty,
    setIsFinish,
    setError,

    // 引用
    errorRef,
  };
}

// ---------- example -----------
const {
  data,
  isLoading,
  isFinish,
  isEmpty,
  loadData,
  refresh,
  retry,
  abortRequest,
} = useList(
  async (page, pageSize) => {
    const res = await fetch(`/api/data?page=${page}&size=${pageSize}`);
    return res.json();
  },
  {
    pageSize: 15,
    debounceTime: 500,
    formatter: (data) =>
      data.map((item) => ({ ...item, date: new Date(item.date) })),
  }
);

// 滚动加载
useEffect(() => {
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 200
    ) {
      loadData();
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [loadData]);
