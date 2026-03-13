/**
 * 表单验证工具类
 */

// 手机号验证
export const isPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 身份证号验证
export const isIdCard = (idCard) => {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard)
}

// 车牌号验证
export const isCarPlate = (plate) => {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/.test(plate)
}

// 金额验证（最多两位小数）
export const isMoney = (money) => {
  return /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(money)
}

// 非空验证
export const isEmpty = (val) => {
  if (val === null || val === undefined || val === '') return true
  if (typeof val === 'string' && val.trim().length === 0) return true
  if (Array.isArray(val) && val.length === 0) return true
  if (typeof val === 'object' && Object.keys(val).length === 0) return true
  return false
}

// 别名导出（兼容部分页面使用 validateXxx 命名风格）
export const validatePhone = isPhone
export const validateIdCard = isIdCard
export const validateCarPlate = isCarPlate

export default {
  isPhone,
  isIdCard,
  isCarPlate,
  isMoney,
  isEmpty,
  validatePhone,
  validateIdCard,
  validateCarPlate
}