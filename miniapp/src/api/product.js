import request from '@/utils/request'

/**
 * 获取商品分类列表
 */
export const getCategories = () => {
  return request({
    url: '/api/v1/products',
    method: 'GET'
  })
}

/**
 * 获取商品列表
 * @param {Object} params { categoryId, keyword, sort, page, pageSize }
 */
export const getProducts = (params) => {
  return request({
    url: '/api/v1/products',
    method: 'GET',
    data: params
  })
}

/**
 * 获取商品详情
 * @param {String} id 商品ID
 */
export const getProductDetail = (id) => {
  return request({
    url: `/api/v1/products/${id}`,
    method: 'GET'
  })
}

/**
 * 搜索商品（支持比价）
 * @param {Object} params { keyword, sort, page, pageSize }
 */
export const searchProducts = (params) => {
  return request({
    url: '/api/v1/products/search',
    method: 'GET',
    data: params
  })
}

/**
 * 获取商品评价列表
 * @param {String} productId 商品ID
 * @param {Object} params { page, pageSize }
 */
export const getProductReviews = (productId, params) => {
  return request({
    url: `/api/v1/products/${productId}`,
    method: 'GET',
    data: params
  })
}

/**
 * 收藏/取消收藏商品
 * @param {String} productId 商品ID
 */
export const toggleFavorite = (productId) => {
  return request({
    url: `/api/v1/products/${productId}`,
    method: 'GET'
  })
}

/**
 * 获取热门商品
 */
export const getHotProducts = () => {
  return request({
    url: '/api/v1/products',
    method: 'GET'
  })
}