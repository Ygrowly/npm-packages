import { Common } from "../common";

/**
 * 登录认证服务
 */
export namespace Auth {
  export enum ApiUrls {
    PawLogin = "/api/v1/auth/login",
    SmsLogin = "/api/v1/auth/login/sms",
    SendSms = "/api/v1/auth/sms/send",
    RefreshToken = "/api/v1/auth/refresh",
    RecaptchaVerify = "/api/v1/auth/recaptcha-verify",
    Logout = "/api/v1/auth/logout",
  }

  export enum Client {
    网页 = "web",
    安卓 = "android",
    小程序 = "mini_program",
  }

  export function logout() {
    return Common.request({
      url: ApiUrls.Logout,
      method: "post",
    });
  }

  export interface AccessModel {
    /**
     * Access Token，访问令牌
     */
    access_token?: string;
    /**
     * Expires In，访问令牌过期时间（秒）
     */
    expires_in?: number;
    /**
     * Refresh Token，刷新令牌
     */
    refresh_token?: string;
    /**
     * Token Type，令牌类型
     */
    token_type?: string;
  }

  export function pawLogin(
    payload: {
      username?: string;
      password?: string;
    } = {}
  ) {
    return Common.request<AccessModel>({
      url: ApiUrls.PawLogin,
      method: "post",
      data: payload,
    });
  }

  export function smsLogin(
    payload: {
      mobile?: string;
      code?: string;
    } = {}
  ) {
    return Common.request<AccessModel>({
      url: ApiUrls.SmsLogin,
      method: "post",
      data: payload,
    });
  }

  /**
   * 发送短信验证码
   * @param payload
   * @see  https://apifox.com/apidoc/shared/6f38bda4-829a-4d9f-99f2-a3108e0b127e/311235038e0
   */
  export function sendSms(payload: {
    country_code?: string;
    mobile?: string;
    send_type?: string;
    token?: string;
    captcha_code?: string;
  }) {
    return Common.request<{
      success?: boolean;
      message?: string;
    }>({
      url: ApiUrls.SendSms,
      method: "post",
      data: payload,
    });
  }

  /**
   * 刷新token
   * @param refresh_token
   */
  export function refreshToken(refresh_token = "") {
    return Common.request<AccessModel>({
      url: ApiUrls.RefreshToken,
      method: "post",
      data: {
        refresh_token,
      },
    });
  }

  // 滑块校验
  export function recaptchaVerify(client: Client, token: string) {
    return Common.request<{
      captcha_code?: string;
    }>({
      url: ApiUrls.RecaptchaVerify,
      method: "post",
      data: {
        client,
        token,
      },
    });
  }
}
