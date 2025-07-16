import React, { useCallback, useEffect } from 'react'
import { storage, isDefined, isFunction, typeToString } from '@gabriel9x9/shared'

/**
 * 生成 缓存 state，轻量的状态管理
 */
export function makeCacheState<T>(
  initialState: T | (() => T),
  storageKey?: string,
  storageActions: Partial<typeof storage> = storage
) {

  const defaultState = isFunction(initialState) ? initialState() : initialState

  const _storagekey = storageKey ? '__cache_state__' + storageKey : ''

  const state = {
    current: defaultState
  }

  const events = {
    current: [] as Array<() => void>
  }

  if (_storagekey) {
    const storageState = storageActions.get?.(_storagekey)
    if (typeToString(state.current) === typeToString(storageState)) {
      state.current = storageState
    } else {
      if (isDefined(storageState)) {
        storageActions.remove?.(_storagekey)
      }
    }
  }

  /**
   * 设置值
   */
  function setState(payload: T | ((prev: T) => T)) {
    state.current = isFunction(payload) ? payload(state.current) : payload
    if (_storagekey) {
      storageActions.set?.(_storagekey, state.current)
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
    if (_storagekey) {
      storageActions.remove?.(_storagekey)
    }
    events.current.forEach((h) => {
      h()
    })
  }

  function useState() {
    const [value, setValue] = React.useState(() => getState())

    const hanlder = useCallback(() => {
      setValue(() => getState())
    }, [])

    useEffect(() => {
      events.current.push(hanlder)
      return () => {
        events.current = events.current.filter((h) => h !== hanlder)
      }
    }, [hanlder])

    return value
  }

  return {
    get: getState,
    set: setState,
    remove: delState,
    useState
  }
}
