type TypeString =
  | '[object String]'
  | '[object Number]'
  | '[object Boolean]'
  | '[object Object]'
  | '[object Date]'
  | '[object Map]'
  | '[object Set]'

export function typeToString(val: unknown) {
  return Object.prototype.toString.call(val) as TypeString
}

/**
 * 是否 array
 */
export const isArray = Array.isArray

/**
 * 是否 string
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

/**
 * 是否 boolean
 */
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'

/**
 * 是否 number
 */
export const isNumber = (val: unknown): val is number => typeof val === 'number'

/**
 * 是否 symbol
 */
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

/**
 * 是否 未定义
 */
export const isUndefined = (val: unknown): val is undefined | null =>
  val === null || val === undefined

/**
 * 是否 定义
 */
export const isDefined = <T = any>(val: T): val is NonNullable<T> => !isUndefined(val)

/**
 * 是否 函数
 */
export const isFunction = (val: unknown): val is (...arg: any[]) => any => typeof val === 'function'

/**
 * 是否 引用类型
 */
export const isObject = (val: unknown): val is Record<any, any> =>
  isDefined(val) && typeof val === 'object'

/**
 * 是否 纯对象
 */
export const isPlainObject = (val: unknown): val is Record<string, any> =>
  isObject(val) && typeToString(val) === '[object Object]'

/**
 * 是否 promise
 */
export const isPromise = (val: unknown): val is Promise<any> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch)

/**
 * 是否 date
 */
export const isDate = (val: unknown): val is Date =>
  isObject(val) && typeToString(val) === '[object Date]'

/**
 * 是否 map
 */
export const isMap = (val: unknown): val is Map<any, any> =>
  isObject(val) && typeToString(val) === '[object Map]'

/**
 * 是否 set
 */
export const isSet = (val: unknown): val is Set<any> =>
  isObject(val) && typeToString(val) === '[object Set]'

/**
 * 是否 是空
 */
export const isEmpty = (val: unknown): val is undefined | null => {
  if (isUndefined(val)) return true
  if (isString(val)) return val.replace(/\s*/g, '') === ''
  if (isNumber(val)) return false
  if (isBoolean(val)) return false
  if (isArray(val)) return val.length === 0
  if (isPlainObject(val)) return Object.keys(val).length === 0
  return !val
}

/**
 * 转换成 array
 */
export function toArray<T>(val: T | T[]) {
  return isUndefined(val) ? [] : isArray(val) ? val : [val]
}

/**
 * 转换成 boolean
 */
export const toBoolean = (val: unknown) => {
  if (isString(val)) {
    if (val === 'true') {
      return true
    }
    if (val === 'false') {
      return false
    }
  }
  return !!val
}

/**
 * 转换成 string
 */
export function toString(val: any): string {
  if (isUndefined(val)) return ''
  if (isString(val)) return val
  if (isBoolean(val)) return val === true ? 'true' : 'false'
  if (isNumber(val)) return val + ''
  if (isFunction(val.toString)) return val.toString()
  if (isPlainObject(val) || isArray(val)) return JSON.stringify(val)
  return ''
}

/**
 * 转换成 number
 */
export function toNumber(val: unknown): number {
  if (isNumber(val)) return val
  const n = parseFloat(val as any)
  return isNaN(n) ? 0 : n
}

/**
 * 是否颜色字符串
 */
export const isColorStr = (val: any): val is string =>
  isString(val) &&
  (val[0] === '#' || val.toLowerCase().includes('rgb') || val.toLowerCase().includes('hex'))


export type Primitive = string | number | boolean | null | undefined

export function isPrimitive(value: any): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}
