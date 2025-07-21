import { Common } from '../common'

/**
 * 用户管理
 */
export namespace Users{

    // 
    export enum ApiUrls{
        GetMeInfo='/api/v1/users/me',
        Index='/api/v1/users',
        ImportData='api/v1/users/import',
        ExportTemplate='api/v1/users/export-template'
    }

    //
    export enum RoleCode {
     后台管理员='backend_admin',
     vip用户='vip_customer',
     普通用户='common_customer',
     游客='tourist'
  }

  export const RoleCodeMap=Common.makeEnumMap(RoleCode)

  // 
  /**
   * 角色页面
   */
  export enum RolePage{
    /** 账户管理 */
    UsersAdmin = '账户管理',
    /** home */
    Home='首页',
    /** talk */
    Interact='交流页',
    /** vlog */
    Vlog='vlog分享页',
    /** shop */
    Shop='应援页'
  }

  export const RolePageMap=Common.makeEnumMap(RolePage)

  export interface RoleModal{
    code?: RoleCode
    name?: string
    pages?: RolePage[]
  }

  export enum UserState {
    正常 = 1,
    禁用 = 2
  }
  
  export interface Model {
    /**
     * Avatar，头像
     */
    avatar?: string
    /**
     * Create Time，创建时间
     */
    create_time?: string
    /**
     * Create User Id，创建人ID
     */
    create_user_id?: number
    /**
     * Is Deleted，是否删除
     */
    is_deleted?: boolean
    /**
     * Is Superuser，是否为超级管理员
     */
    is_superuser?: boolean
    /**
     * Last Login Time，最后登录时间
     */
    last_login_time?: string
    /**
     * Mobile，手机号
     */
    mobile?: string
    /**
     * Nickname，昵称
     */
    nickname?: string
    /**
     * Real Name，真实姓名
     */
    real_name?: string
    /**
     * Roles，角色列表
     */
    roles?: RoleCode[]
    /**
     * Status，激活状态(1:正常, 2:禁用)
     */
    status?: UserState
    /**
     * Update Time，更新时间
     */
    update_time?: string
    /**
     * Update User Id，更新人ID
     */
    update_user_id?: string
    /**
     * User Id，用户ID
     */
    user_id?: number
    /**
     * Username，用户名
     */
    username?: string
    /**
     * Company Id，公司ID
     */
    company_id?: string
    /**
     * Password，密码
     */
    password?: string
  }

  export interface EnumModel {
    /**
     * User Id，用户ID
     */
    user_id: number
    /**
     * Username，用户名
     */
    username: string
  }

  /**
   * 获取当前用户信息
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235040e0
   */
  export function getMeInfo() {
    return Common.request<Model>({
      url: ApiUrls.GetMeInfo,
      method: 'get'
    })
  }

  const apis = Common.makeApis<Model, 'user_id', EnumModel>(ApiUrls.Index, 'user_id')

  /**
   * 获取用户列表
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235044e0
   */
  export const getPageList = apis.getPageList

  /**
   * 获取用户详情
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235041e0
   */
  export const getInfo = apis.getInfo

  /**
   * 创建用户
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235045e0
   */
  export const add = apis.add

  /**
   * 更新用户信息
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235042e0
   */
  export const edit = apis.edit

  /**
   * 删除用户
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235043e0
   */
  export const del = apis.del

  /**
   *
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/312381713e0
   */
  export const getEnumList = apis.getEnumList

  /**
   * 批量禁用用户
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235046e0
   */
  export function batchDisable(user_ids: number[] = []) {
    return apis.request('post', '/batch/disable', {
      user_ids
    })
  }

  /**
   * 批量启用用户
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235047e0
   */
  export function batchEnable(user_ids: number[] = []) {
    return apis.request('post', '/batch/enable', {
      user_ids
    })
  }

  /**
   * 批量删除用户
   * @see https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235048e0
   */
  export function batchDelete(user_ids: number[] = []) {
    return apis.request('post', '/batch/delete', {
      user_ids
    })
  }

  /**
   * 导出用户导入模板
   * @returns
   */
  export function exportTemplate() {
    return Common.request<any>({
      url: ApiUrls.ExportTemplate,
      method: 'get'
    })
  }

  /**
   * 导入用户
   * @param file
   * @returns
   */
  export function importData(file: any) {
    return Common.request({
      url: ApiUrls.ImportData,
      method: 'post',
      data: {
        file
      }
    })
  }

  /**
   * super
   */
  export const SuperuserPages=[
    RolePage.UsersAdmin,
    RolePage.Home,
    RolePage.Interact,
    RolePage.Shop,
    RolePage.Vlog
  ]
  function makeRole(code:RoleCode,name='',pages:RolePage[]=[]){
    return {
        code,
        name,
        pages
    }
  }
  /**
   * 获得角色列表
   * @returns
   */
  export function getRoleList(){
    return [
        makeRole(RoleCode.后台管理员,'后台管理员',[
            RolePage.Interact,
            RolePage.Shop,
            RolePage.UsersAdmin,
            RolePage.Vlog
        ]),
        makeRole(RoleCode.vip用户,'vip用户',[
            RolePage.Interact,
            RolePage.Shop,
            RolePage.Vlog
        ]),
        makeRole(RoleCode.普通用户,'普通用户',[
            RolePage.Interact,
            RolePage.Shop
        ]),
        makeRole(RoleCode.游客,'游客',[])
    ]
  }

}