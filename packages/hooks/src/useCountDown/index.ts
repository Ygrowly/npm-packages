import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 倒计时
 * @param initialSeconds 秒 60
 * @returns
 */
export function useCountDown(initSeconds=60){
    const [seconds,setSeconds]=useState(initSeconds)

    const [isActive,setIsActive]=useState(false)

    const timeRef=useRef<any>(null)

    const start=useCallback(()=>{
        setIsActive(true)
        setSeconds(initSeconds)
    },[initSeconds])

    const pause=useCallback(()=>{
        setIsActive(false)
    },[])

    const reset=useCallback(()=>{
        setIsActive(false)
        setSeconds(initSeconds)
    },[initSeconds])

    useEffect(()=>{
        if(isActive&&seconds>0){
            timeRef.current=setTimeout(()=>{
                setSeconds((prev)=>prev-1)
            },1000)
        }else if(seconds===0){
            setIsActive(false)
        }
        return ()=>{
            if(timeRef.current){
                clearTimeout(timeRef.current)
            }
        }
    },[isActive,seconds])

    return {
        seconds,
        isActive,
        start,
        pause,
        reset
    }
}
