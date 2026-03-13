/**
 * 全局配置
 */
export default {
  // 应用名称
  APP_NAME: '乡里乡亲',

  // API 基础地址
  API_BASE_URL: 'http://localhost:3000/api',

  // 图片上传地址
  UPLOAD_URL: 'http://localhost:3000/api/upload',

  // 默认头像
  DEFAULT_AVATAR: '/static/images/default-avatar.png',

  // 默认商品图片
  DEFAULT_PRODUCT_IMAGE: '/static/images/default-product.png',

  // 分页配置
  PAGE_SIZE: 10,

  // 图片最大上传数量
  MAX_IMAGE_COUNT: 9,

  // 图片最大大小（MB）
  MAX_IMAGE_SIZE: 5,

  // 订单状态映射
  ORDER_STATUS: {
    0: '待付款',
    1: '待接单',
    2: '待配送',
    3: '配送中',
    4: '已完成',
    5: '已取消',
    6: '退款中',
    7: '已退款'
  },

  // 订单状态颜色
  ORDER_STATUS_COLOR: {
    0: '#ff9900',
    1: '#2979ff',
    2: '#2979ff',
    3: '#19be6b',
    4: '#909399',
    5: '#909399',
    6: '#ff4d4f',
    7: '#909399'
  },

  // 顺风车行程状态
  TRIP_STATUS: {
    0: '待出发',
    1: '进行中',
    2: '已完成',
    3: '已取消'
  },

  // 配送方式
  DELIVERY_TYPE: {
    1: '立即配送',
    2: '预约配送',
    3: '到店自取'
  }
}