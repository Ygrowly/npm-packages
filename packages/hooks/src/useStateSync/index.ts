import { useState, useCallback, useRef } from 'react'

import { isFunction } from '@gabriel9x9/shared'

/**
 * 同步 state。解决更新 state 后，无法获取最新值，ref副本
 * @param initState
 */
export function useStateSync<S = any>(
  initState: S | (() => S)
): [S, (action: S | ((state: S) => S)) => void, () => S] {
    
  const ref = useRef(isFunction(initState) ? initState() : initState)

  const [state, setSate] = useState(ref.current)

  const dispatch = useCallback((setStateAction: S | ((state: S) => S)) => {
    ref.current = isFunction(setStateAction) ? setStateAction(ref.current) : setStateAction
    setSate(ref.current)
  }, [])

  const getState = useCallback(() => ref.current, [])

  return [state, dispatch, getState]
}
