/** 链接 */
export const regLink =
  /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/

/** 电话 */
export const regPhone =
  /^((13[0-9])|(14[5-9])|(15([0-3]|[5-9]))|(16[5-7])|(17[1-8])|(18[0-9])|(19[1|3])|(19[5|6])|(19[8|9]))\d{8}$/

/**正数 */
export const regNumber = /^[0-9]+\.?[0-9]*$/

/**
 * 正整数
 */
export const regDecimal = /^[1-9]\d*$/

/**
 * 正数 两位小数
 */
export const regTwoDecimal = /^\d+(\.\d{1,2})?$/

/**
 * 正数 三位小数
 */
export const regThreeDecimal = /^\d+(\.\d{1,3})?$/

/**
 *  两位小数
 */
export const regPlainTwoDecimal = /^[-+]?\d*\.?\d{0,2}$/

/**
 *  三位小数
 */
export const regPlainThreeDecimal = /^[-+]?\d*\.?\d{0,3}$/
