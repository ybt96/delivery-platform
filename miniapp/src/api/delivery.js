import request from '@/utils/request'

/**
 * 创建配送任务
 * @param {Object} data
 */
export const createDeliveryTask = (data) => {
  return request({
    url: '/api/v1/deliveries',
    method: 'POST',
    data
  })
}

/**
 * 获取我的配送任务
 * @param {Object} params { skip, take, status }
 */
export const getMyDeliveryTasks = (params) => {
  return request({
    url: '/api/v1/deliveries/my',
    method: 'GET',
    data: params
  })
}

/**
 * 获取配送任务详情
 * @param {number|string} id
 */
export const getDeliveryTaskDetail = (id) => {
  return request({
    url: `/api/v1/deliveries/${id}`,
    method: 'GET'
  })
}

/**
 * 更新配送任务
 * @param {number|string} id
 * @param {Object} data
 */
export const updateDeliveryTask = (id, data) => {
  return request({
    url: `/api/v1/deliveries/${id}`,
    method: 'PATCH',
    data
  })
}

/**
 * 获取配送轨迹
 * @param {number|string} id
 */
export const getDeliveryTracks = (id) => {
  return request({
    url: `/api/v1/deliveries/${id}/tracks`,
    method: 'GET'
  })
}