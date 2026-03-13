import request from '@/utils/request'

/**
 * 获取附近服务站列表
 * 后端控制器：/api/v1/stations/nearby
 * @param {Object} params
 */
export const getStations = (params) => {
  return request({
    url: '/api/v1/stations/nearby',
    method: 'GET',
    data: params
  })
}

/**
 * 获取服务站详情
 * 后端控制器：/api/v1/stations/:id
 * @param {number|string} id
 */
export const getStationDetail = (id) => {
  return request({
    url: `/api/v1/stations/${id}`,
    method: 'GET'
  })
}

/**
 * 创建代购订单
 * 后端控制器：/api/v1/stations/purchase-orders
 * @param {Object} data
 */
export const createPurchaseOrder = (data) => {
  return request({
    url: '/api/v1/stations/purchase-orders',
    method: 'POST',
    data
  })
}

/**
 * 获取代购订单列表
 * 后端控制器：/api/v1/stations/purchase-orders
 * @param {Object} params
 */
export const getPurchaseOrders = (params) => {
  return request({
    url: '/api/v1/stations/purchase-orders',
    method: 'GET',
    data: params
  })
}