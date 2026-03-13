import request from '@/utils/request'

/**
 * 微信一键登录
 * @param {Object} data { code, iv, encryptedData }
 */
export const wxLogin = (data) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

/**
 * 手机号验证码登录
 * @param {Object} data { phone, code }
 */
export const phoneLogin = (data) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

/**
 * 获取验证码
 * @param {Object} data { phone }
 */
export const sendCode = (data) => {
  return request({
    url: '/auth/send-sms',
    method: 'POST',
    data
  })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/api/v1/users/me',
    method: 'GET'
  })
}

/**
 * 更新用户信息
 * @param {Object} data 用户信息
 */
export const updateUserInfo = (data) => {
  return request({
    url: '/api/v1/users/me',
    method: 'PATCH',
    data
  })
}