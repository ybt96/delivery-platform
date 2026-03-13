import request from '@/utils/request'

const formatTripDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

const normalizeCarpoolTrip = (item = {}) => {
  const fromPlace = item.fromPlace || item.startPlace || item.from || item.fromAddress || item.village || '未知出发地'
  const toPlace = item.toPlace || item.endPlace || item.to || item.toAddress || item.village || '未知目的地'
  const price = item.price ?? item.pricePerSeat ?? 0
  const totalSeats = item.totalSeats ?? item.seats ?? 0
  const availableSeats = item.availableSeats ?? item.remainSeats ?? totalSeats ?? 0
  const driverName = item.driverName || item.publisherName || item.driver?.nickname || item.driver?.name || '车主'
  const driverAvatar = item.driverAvatar || item.driver?.avatar || ''
  const carInfoParts = [
    item.vehicleColor,
    item.vehicleBrand,
    item.vehiclePlate
  ].filter(Boolean)

  return {
    ...item,
    fromPlace,
    toPlace,
    distance: item.distance ?? item.distanceKm ?? '',
    duration: item.duration || item.durationText || '',
    departureTime: item.departureTime ? formatTripDateTime(item.departureTime) : (item.departAt || ''),
    totalSeats,
    availableSeats,
    price,
    driverName,
    driverAvatar,
    driverPhone: item.driverPhone || item.driver?.phone || '',
    isCertified: item.isCertified ?? item.driver?.isVerified ?? true,
    rating: item.rating || item.driver?.rating || '5.0',
    tripCount: item.tripCount ?? item.driver?.tripCount ?? 0,
    carInfo: item.carInfo || carInfoParts.join(' '),
    description: item.description || ''
  }
}

/**
 * 获取顺风车行程列表
 * @param {Object} params { skip, take, village, departureTime }
 */
export const getCarpoolTrips = async (params) => {
  const res = await request({
    url: '/api/v1/carpool/trips',
    method: 'GET',
    data: params
  })

  const rawList = Array.isArray(res) ? res : (res?.list || res?.items || [])
  const list = rawList.map(normalizeCarpoolTrip)

  if (Array.isArray(res)) {
    return list
  }

  return {
    ...res,
    list
  }
}

/**
 * 获取顺风车行程详情
 * 当前后端未提供 trips/:id 详情接口，先通过列表接口按 id 过滤兼容现有页面与 store 调用。
 * @param {string | number} id 行程 ID
 */
export const getCarpoolTripDetail = async (id) => {
  const res = await getCarpoolTrips({ skip: 0, take: 100 })
  const list = Array.isArray(res) ? res : (res?.list || res?.items || [])
  const trip = list.find((item) => String(item.id) === String(id))

  if (trip) {
    return normalizeCarpoolTrip(trip)
  }

  throw new Error(`未找到顺风车行程详情: ${id}`)
}

/**
 * 发布行程
 * @param {Object} data CreateCarpoolTripDto
 */
export const publishTrip = (data) => {
  return request({
    url: '/api/v1/carpool/trips',
    method: 'POST',
    data
  })
}

/**
 * 创建预约
 * @param {Object} data CreateCarpoolBookingDto
 */
export const createBooking = (data) => {
  return request({
    url: '/api/v1/carpool/bookings',
    method: 'POST',
    data
  })
}

/**
 * 预约顺风车
 * 兼容现有页面与 store 调用签名。
 * @param {string | number} tripId 行程 ID
 * @param {Object} data 附加预约信息
 */
export const bookTrip = (tripId, data = {}) => {
  return createBooking({
    tripId,
    ...data
  })
}

/**
 * 获取我的预约
 * @param {Object} params { status }
 */
export const getMyBookings = (params) => {
  return request({
    url: '/api/v1/carpool/my-bookings',
    method: 'GET',
    data: params
  })
}