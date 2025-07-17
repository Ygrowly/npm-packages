import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 倒计时
 * @param initialSeconds 秒 60
 * @returns
 */
export function useCountDown(initialSeconds = 60) {
    
  const [seconds, setSeconds] = useState(initialSeconds)

  const [isActive, setIsActive] = useState(false)

  const timerRef = useRef<any>(null)

  const start = useCallback(() => {
    setIsActive(true)
    setSeconds(initialSeconds)
  }, [initialSeconds])

  const pause = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback(() => {
    setIsActive(false)
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setTimeout(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsActive(false)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isActive, seconds])

  return {
    seconds,
    isActive,
    start,
    pause,
    reset
  }
}
