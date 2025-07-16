import { type AnyObj} from './../type'

export type ServiceRequestMethod='get'|'post'|'put'|'delete'|'patch'

export type ServiceRequestApp='common'|'css'

export interface ServiceRequestConfig<D extends AnyObj=AnyObj,P extends AnyObj=AnyObj>{
    method?:ServiceRequestMethod
    data?:D
    params?:P
    url?:string
    _app_?:ServiceRequestApp
}

export interface ServiceResponse<D=any>{
    data?:D
    msg?:string
    code?:number
}

async function defRequest<R=any,D extends AnyObj=AnyObj,P extends AnyObj=AnyObj>(
    _:ServiceRequestConfig<D,P>
){
    return {
        data:undefined,
        msg:'',
        code: 0
    } as ServiceResponse<R>
}

export const service={
    request:defRequest
}