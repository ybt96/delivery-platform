import request from '@/utils/request'

/**
 * 获取联盟商家列表
 * 当前后端尚未提供独立联盟商家接口，先复用商家列表接口兼容页面调用。
 * @param {Object} params { category, page, pageSize }
 */
const ALLIANCE_CATEGORY_MAP = {
  cater: '餐饮美食',
  supermarket: '商超便利',
  life: '生活服务',
  entertainment: '休闲娱乐'
}

const normalizeAllianceMerchant = (item, category) => ({
  ...item,
  logo: item.logo || item.banner || '/static/images/default-img.png',
  distance: item.distance ?? item.distanceKm ?? '',
  categoryName: item.categoryName || ALLIANCE_CATEGORY_MAP[category] || item.categoryLabel || '联盟商家',
  discountDesc: item.discountDesc || item.description || '联盟会员专享优惠'
})

export const getAllianceMerchants = async (params) => {
  const { page = 1, pageSize = 10, ...rest } = params || {}
  const res = await request({
    url: '/api/v1/merchants',
    method: 'GET',
    data: {
      skip: (page - 1) * pageSize,
      take: pageSize,
      ...rest
    }
  })

  const rawList = Array.isArray(res) ? res : (res?.list || res?.items || [])
  const list = rawList.map((item) => normalizeAllianceMerchant(item, rest.category))

  if (Array.isArray(res)) {
    return list
  }

  return {
    ...res,
    list
  }
}

/**
 * 获取优惠券列表
 * @param {Object} params { skip, take, merchantId, status }
 */
export const getCoupons = (params) => {
  return request({
    url: '/api/v1/alliance/coupons',
    method: 'GET',
    data: params
  })
}

/**
 * 领取优惠券
 * @param {String|Number} couponId 优惠券模板ID
 */
export const claimCoupon = (couponId) => {
  return request({
    url: `/api/v1/alliance/coupons/${couponId}/receive`,
    method: 'POST'
  })
}

/**
 * 获取我的优惠券
 * @param {Object} params { status }
 */
export const getMyCoupons = (params) => {
  return request({
    url: '/api/v1/alliance/my-coupons',
    method: 'GET',
    data: params
  })
}