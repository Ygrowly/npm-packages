import {
  isArray,
  isObject,
  isUndefined,
  isSet,
  isMap,
  isPlainObject,
  isDefined,
  isFunction,
  toString,
  toArray,
  isEmpty
} from './shape'
import { _global_ } from '../global'
import { toString } from './shape';


const map=new Map<string,any>()

/**
 * 设置一次缓存
 * @param key 
 * @param val 
 * @returns 
 */
export function setCacheResult<T>(key:string,val:T|(()=>T)):T{
    const value=map.get(key)
    if(isDefined(value))
        return value
    const newValue=isFunction(val)?val():val
    map.set(key,newValue)
    return newValue
}

/**
 * 高空函数
 */
export const noop:(...reg:any[])=>any=()=>{}

/**
 * 睡眠
 * @param wait 时长，默认 1000
 * @param cb 回调函数
 */
export function sleep(wait=1000,cb=noop):Promise<null>{
    return new Promise((resolve)=>{
        setTimeout(()=>{
            cb()
            resolve(null)
        },wait)
    })
}

/**
 * 深拷贝
 * @param obj
 */
export function cloneDeep<T>(obj:T):T{
    if(!isObject(obj)||isUndefined(obj))
        return obj
    let copyObj:any
    if(isArray(obj)){
        copyObj=[]
        for(let i=0;i<obj.length;i++){
            copyObj.push(cloneDeep(obj[i]))
        }
    }else if(isSet(obj)){
        copyObj=new Set([...obj])
    }else if(isMap(obj)){
        copyObj=new Map([...obj])
    }else{
        copyObj={}
        Reflect.ownKeys(obj).forEach((key)=>{
            copyObj[key]=cloneDeep(obj[key as string])
        })
    }
    return copyObj
}

/**
 * 浅拷贝
 * @param obj
 */
export function cloneDeepWith<T>(obj: T): T {
  if (!isObject(obj) || isUndefined(obj)) {
    return obj
  }
  let copyObj: any
  if (isArray(obj)) {
    copyObj = []
    for (let i = 0; i < obj.length; i++) {
      copyObj.push(obj[i])
    }
  } else if (isSet(obj)) {
    copyObj = new Set([...obj])
  } else if (isMap(obj)) {
    copyObj = new Map([...obj])
  } else {
    copyObj = {}
    Reflect.ownKeys(obj).forEach((key) => {
      copyObj[key] = obj[key as string]
    })
  }
  return copyObj
}

/**
 * 生成异步操作
 * @param fn
 * @returns
 */
export function makeAsyncAction<P extends any[]=any[],R=any>(
    fn:(...res:P)=>Promise<R>){
        let isLoading=false
        const action=async(...args:P):Promise<R|void> =>{
            if(isLoading)
                return
            isLoading=true
            try{
                const result=await fn(...args)
                return result
            }finally{
                isLoading=false
            }
        }
        action.getLoading=()=>isLoading
        return action
}
// const fetchUser = makeAsyncAction(async (id: string) => {
//   return await api.getUser(id)
// })

// await fetchUser('123')
// console.log(fetchUser.getLoading()) // false


/**
 * storage
 */
interface StoredValue<T>{
    value:T
    expires?:number
}

export const storage={
    get<T=any>(key:string):T|null{
        try{
            const raw=_global_.localStorage?.getItem(key)
            if(!raw)
                return null
            const parsed:StoredValue<T>=JSON.parse(raw)
            if(parsed.expires&&Date.now()>parsed.expires){
                _global_.localStorage?.removeItem(key)
                return null
            }
            return parsed.value
        }catch{
            return null
        }
    },
    set<T=any>(key:string,value:T,ttlMs?:number):void{
        const data:StoredValue<T>={
            value,
            ...(ttlMs?{expires:Date.now()+ttlMs}:{})
        }
        _global_.localStorage?.setItem(key,JSON.stringify(data))
    },
    remove(key:string):void{
        _global_.localStorage?.removeItem(key)
    },
    clear():void{
        _global_.localStorage?.clear()
    }
}

/**
 * 获取错误信息
 * @param value
 * @returns
 */
export function getErrorMessage(value:any):string{
    if(isDefined(value))
        return ''
    try{
        if(typeof value==='string') return value
        if(typeof value==='number') return toString(value)
        if(value instanceof Error) return value.message

        const msg=
        value?.errorMessage??
        value?.errMsg??
        value?.msg??
        value?.message??
        (isFunction(value.toString)?value.toString():'')
        return toString(msg)
    }catch{
        return '[Unknown Error]'
    }
}
