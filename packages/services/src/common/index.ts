import {
  service,
  ServiceRequestConfig,
  ServiceRequestMethod,
  toString,
} from "@ygrowly/shared";

/**
 * 公共服务
 * 封装了用于发请求和快速构建 CRUD API 的工具
 */
export namespace Common {
  export enum ApiUrls {
    Shop = "/api/v1/common/shops",
  }

  /**
   * 请求方法
   * @param config
   * @returns
   */
  export function request<R = any>(config: ServiceRequestConfig) {
    return service.request<R>({
      ...config,
      _app_: "css",
    });
  }
  // -------分页--------
  // 入参
  export interface RequestPaginationParams {
    size?: number; // 每页条数
    page?: number; // 当前页码
  }
  // 回参
  export interface ResponsePaginationData<V = any> {
    total?: number; // 总记录数
    page?: number; // 当前页码
    items?: V[]; // data
    pages?: number; // all pages
    size?: number; // 每页记录数
  }

  /**
   * 快速创建 crud
   * @param url
   * @param idFiled
   * @returns
   */
  export function makeApis<
    T extends Record<string, any> = Record<string, any>,
    K extends keyof T = keyof T,
    E extends Record<string, any> = T
  >(url: string, idFiled: K) {
    /**
     * list page
     */
    function getPageList(payload: T & RequestPaginationParams) {
      return request<ResponsePaginationData<T>>({
        url: `${url}`,
        method: "get",
        params: payload,
      });
    }
    /**
     * list not page
     */
    function getList(payload?: T) {
      return request<Array<T>>({
        url: `${url}`,
        method: "get",
        params: payload || {},
      });
    }
    /**
     * list enum
     */
    function getEnumList(payload?: T) {
      return request<Array<T>>({
        url: `${url}`,
        method: "get",
        params: payload || {},
      });
    }
    /**
     * delete
     */
    function del(payload: T[K]) {
      return request({
        url: `${url}/${toString(payload)}`,
        method: "delete",
      });
    }
    /**
     * add
     */
    function add(payload: T) {
      return request<T>({
        url: `${url}`,
        data: payload,
        method: "post",
      });
    }
    /**
     * edit
     */
    function edit(payload: T) {
      return request({
        url: `${url}/${toString(payload[idFiled])}`,
        data: payload,
        method: "put",
      });
    }
    /**
     * detail
     */
    function getInfo(payload: T[K]) {
      return request<T>({
        url: `${url}/${toString(payload)}`,
        method: "get",
      });
    }
    /**
     * request
     */
    function _request<T = any>(
      method: ServiceRequestMethod = "get",
      path = "",
      payload: Record<string, any> = {}
    ) {
      return request<T>({
        url: `${url}${path}`,
        method: method,
        params: method === "get" ? payload : {},
        data: method === "get" ? {} : payload,
      });
    }

    return {
      getPageList,
      getEnumList,
      getList,
      add,
      edit,
      del,
      getInfo,
      request: _request,
    };
  }
  /**
   * 枚举 map
   */
  export interface EnumMapValue {
    value: any;
    label: string;
    tag?: {
      color?:
        | "default"
        | "success"
        | "primary"
        | "danger"
        | "warning"
        | "info"
        | ""
        | "text-primary"
        | "text-regular"
        | "text-secondary"
        | "text-placeholder"
        | "text-disabled";
      plain?: boolean;
      text?: boolean;
    };
  }

  /**
   * 生成 枚举map
   * 把 enum 转成 Map<value, { value, label, tag }> 格式
   * @param myEnum
   * @param options
   * @returns
   */
  export function makeEnumMap<T extends Record<string, any>>(
    myEnum: T,
    options: {
      label?: (value: T[keyof T], key: string) => any;
      tag?: (value: T[keyof T], key: string) => EnumMapValue["tag"];
    } = {}
  ) {
    const enumKeys = Object.keys(myEnum).filter((key) => isNaN(Number(key)));
    const map = new Map<T[keyof T], EnumMapValue>();
    enumKeys.forEach((key) => {
      const value = myEnum[key];
      map.set(value, {
        label: options.label?.(value, key) || key,
        value,
        tag: options.tag?.(value, key) || {},
      });
    });
    return map;
  }
}
