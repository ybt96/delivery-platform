import request from '@/utils/request'

/**
 * 创建订单
 * @param {Object} data 订单信息
 */
export const createOrder = (data) => {
  return request({
    url: '/api/v1/orders',
    method: 'POST',
    data
  })
}

/**
 * 获取订单列表
 * @param {Object} params { skip, take, status }
 */
export const getOrders = (params) => {
  return request({
    url: '/api/v1/orders/my',
    method: 'GET',
    data: params
  })
}

/**
 * 获取订单详情
 * @param {String} id 订单ID
 */
export const getOrderDetail = (id) => {
  return request({
    url: `/api/v1/orders/${id}`,
    method: 'GET'
  })
}

/**
 * 取消订单
 * @param {String} id 订单ID
 * @param {String} reason 取消原因
 */
export const cancelOrder = (id, reason) => {
  return request({
    url: `/api/v1/orders/${id}/status`,
    method: 'PATCH',
    data: { status: 5, reason }
  })
}

/**
 * 确认收货
 * @param {String} id 订单ID
 */
export const confirmOrder = (id) => {
  return request({
    url: `/api/v1/orders/${id}/status`,
    method: 'PATCH',
    data: { status: 4 }
  })
}

/**
 * 申请退款
 * @param {String} id 订单ID
 * @param {Object} data { reason, description, images }
 */
export const refundOrder = (id, data) => {
  return request({
    url: `/api/v1/orders/${id}/status`,
    method: 'PATCH',
    data: { status: 6, ...data }
  })
}

/**
 * 评价订单
 * 当前后端尚未提供正式评价接口，先保留前端调用占位
 * @param {String} id 订单ID
 * @param {Object} data 评价信息
 */
export const evaluateOrder = (id, data) => {
  return request({
    url: `/api/v1/orders/${id}`,
    method: 'GET',
    data
  })
}

/**
 * 获取配送员位置
 * @param {String} id 订单ID
 */
export const getDeliveryTrack = (id) => {
  return request({
    url: `/api/v1/deliveries/${id}/tracks`,
    method: 'GET'
  })
}