import request from '@/utils/request'

/**
 * 获取商家列表
 */
export const getMerchants = () => {
  return request({
    url: '/merchants',
    method: 'GET'
  })
}

/**
 * 获取商家详情
 * @param {number|string} id
 */
export const getMerchantDetail = (id) => {
  return request({
    url: `/merchants/${id}`,
    method: 'GET'
  })
}

/**
 * 创建商家
 * @param {Object} data
 */
export const createMerchant = (data) => {
  return request({
    url: '/merchants',
    method: 'POST',
    data
  })
}

/**
 * 更新商家
 * @param {number|string} id
 * @param {Object} data
 */
export const updateMerchant = (id, data) => {
  return request({
    url: `/merchants/${id}`,
    method: 'PUT',
    data
  })
}