
export const _global_ = {
  document: typeof document === 'undefined' ? undefined : document,
  localStorage: typeof localStorage === 'undefined' ? undefined : localStorage,
  global: (typeof window === 'undefined' ? {} : window) as Record<string, any>
}
