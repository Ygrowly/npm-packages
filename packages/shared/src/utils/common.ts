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
    if(!isDefined(value))
        return ''
    try{
        if(typeof value==='string') return value
        if(typeof value==='number') return toString(value)
        if((value as any) instanceof Error) return value.message

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

/**
 * 平铺树形数据
 * @param tree
 * @param childrenKey
 * @returns
 */
export function flattenTree<
  T extends Record<string, any> = Record<string, any>,
  Ck extends keyof T = keyof T
>(
  tree: T[],
  childrenKey?: Ck
): Array<
  T & {
    _parents: T[]
    _level: number
  }
> {
  const result: T[] = []

  function recurse(node: T, _parents: T[] = []) {
    const _item = {
      ...node,
      _parents,
      _level: _parents.length + 1
    }
    result.push(_item)
    const children = toArray(node[childrenKey || 'children'])
    children.forEach((child) => recurse(child, [..._parents, _item]))
  }

  tree.forEach((root) => recurse(root))

  return result as any
}

/**
 * 字典解析
 * @param value
 * @param data
 * @param options
 * @returns
 */
export function formatDict<
T extends Record<string,any>=any,
Vk extends keyof T='value',
Lk extends keyof T='label'
>(
    value:any,
    data:T[]=[],
    options:{
        valueKey?:Vk
        labelKey?:Lk
        separator?:string
        fallback?:(val:any)=>string
    }={}
):string{
    const {
        valueKey='value' as Vk,
        labelKey='label' as Lk,
        separator='、',
        fallback=(val)=>toString(val)
    }=options

    const list=toArray(value).map((val)=>{
        const item=data.find((d)=>toString(d[valueKey])===toString(val))
        return toString(item?.[labelKey])||fallback(val)
    })
    return list.join(separator)
}

/**
 * 生成随机uuid
 * @returns
 */
export function generateUUID() {
  let timestamp = new Date().getTime()
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (timestamp + Math.random() * 16) % 16 | 0
    timestamp = Math.floor(timestamp / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}


//
const scriptMap=new Map<string,{status: 'loading'|'loaded'|'error';queue:Function[]}>()

export function loadAsyncScript<T=any>(src:string,globalKey?:string):Promise<T|null>{
    const id=setCacheResult(src,generateUUID)

    return new Promise((resolve,reject)=>{
        const getGlobal=()=>
            globalKey?(_global_.global?.[globalKey] as T|null):null

        const existingScript=_global_.document?.getElementById(id)
        const entry=scriptMap.get(id)

        if(entry?.status==='loaded'){
            resolve(getGlobal())
            return 
        }
        if(entry?.status==='loading'){
            entry.queue.push((err?:any)=>(err?reject(err):resolve(getGlobal())))
            return
        }

        scriptMap.set(id,{
            status:'loaded',
            queue: [(err?:any)=>(err?reject(err):resolve(getGlobal()))]
        })

        const script=_global_.document?.createElement('script')
        if(!script){
            reject('Cannot create script element')
            return
        }

        script.src=src
        script.id=id
        script.async=true

        script.onload=()=>{
            scriptMap.get(id)?.queue.forEach((fn)=>fn())
            scriptMap.set(id,{status:'loaded',queue:[]})
        }

        script.onerror=(err)=>{
            scriptMap.get(id)?.queue.forEach((fn)=>fn(err))
            scriptMap.set(id,{status:'error',queue:[]})
            _global_.document?.head.removeChild(script)
        }

        _global_.document?.head.appendChild(script)
    })
}

// 节流 & 防抖
export function throttle<P extends any[]>(
    fn:(...args:P)=>any,
    limit=1000,
    immediate=true
){
    let lastTime=0
    let timer:any=null

    const throttled=(...args:P)=>{
        const now=Date.now()
        const remaining=limit-(now-lastTime)

        if(remaining<=0||!lastTime){
            if(timer){
                clearTimeout(timer)
                timer=null
            }
            lastTime=now
            fn(...args)
        }else if(!timer&&!immediate){
            timer=setTimeout(()=>{
                lastTime=Date.now()
                fn(...args)
                timer=null
            },remaining)
        }
    }
    throttled.cancel=()=>{
        clearTimeout(timer)
        timer=null
    }
    return throttled
}

export function debounce<P extends any[]>(
  fn: (...args: P) => any,
  delay = 300,
  immediate = false
) {
  let timer: any = null
  let result: any

  const debounced = (...args: P) => {
    if (timer) clearTimeout(timer)

    if (immediate && !timer) {
      result = fn(...args)
    }

    timer = setTimeout(() => {
      if (!immediate) result = fn(...args)
      timer = null
    }, delay)

    return result
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}
