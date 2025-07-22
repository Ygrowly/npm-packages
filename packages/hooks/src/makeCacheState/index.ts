import React, { useCallback, useEffect } from 'react'
import { storage, isDefined, isFunction, typeToString } from '@ygrowly/shared'

/**
 * 生成 缓存 state，轻量的状态管理
 */
export function makeCacheState<T>(
  initialState: T | (() => T),
  storageKey?: string,
  storageActions: Partial<typeof storage> = storage
) {

  const defaultState = isFunction(initialState) ? initialState() : initialState

  const _storageKey = storageKey ? '__cache_state__' + storageKey : ''

  const state = {
    current: defaultState
  }

  const events = {
    current: [] as Array<() => void>
  }

  if (_storageKey) {
    const storageState = storageActions.get?.(_storageKey)
    if (typeToString(state.current) === typeToString(storageState)) {
      state.current = storageState
    } else {
      if (isDefined(storageState)) {
        storageActions.remove?.(_storageKey)
      }
    }
  }

  /**
   * 设置值
   */
  function setState(payload: T | ((prev: T) => T)) {
    state.current = isFunction(payload) ? payload(state.current) : payload
    if (_storageKey) {
      storageActions.set?.(_storageKey, state.current)
    }
    events.current.forEach((h) => {
      h()
    })
  }

  /**
   * 获取值
   */
  function getState() {
    return state.current
  }

  /**
   * 删除值
   */
  function delState() {
    state.current = defaultState
    if (_storageKey) {
      storageActions.remove?.(_storageKey)
    }
    events.current.forEach((h) => {
      h()
    })
  }

  function useState() {
    const [value, setValue] = React.useState(() => getState())

    const handler = useCallback(() => {
      setValue(() => getState())
    }, [])

    useEffect(() => {
      events.current.push(handler)
      return () => {
        events.current = events.current.filter((h) => h !== handler)
      }
    }, [handler])

    return value
  }

  return {
    get: getState,
    set: setState,
    remove: delState,
    useState
  }
}
