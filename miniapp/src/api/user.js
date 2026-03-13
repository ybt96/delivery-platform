import request from '@/utils/request'

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/api/v1/users/me',
    method: 'GET'
  })
}

/**
 * 更新当前用户信息
 * @param {Object} data
 */
export const updateUserInfo = (data) => {
  return request({
    url: '/api/v1/users/me',
    method: 'PATCH',
    data
  })
}

/**
 * 获取用户列表（管理员）
 * @param {Object} params { skip, take }
 */
export const getUsers = (params) => {
  return request({
    url: '/api/v1/users',
    method: 'GET',
    data: params
  })
}

/**
 * 获取用户详情（管理员）
 * @param {number|string} id
 */
export const getUserDetail = (id) => {
  return request({
    url: `/api/v1/users/${id}`,
    method: 'GET'
  })
}