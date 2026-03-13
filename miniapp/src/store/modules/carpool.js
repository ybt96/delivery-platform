import { defineStore } from 'pinia'
import * as carpoolApi from '@/api/carpool'

export const useCarpoolStore = defineStore('carpool', {
  state: () => ({
    // 行程列表（搜索结果）
    tripList: [],
    tripLoading: false,
    tripHasMore: true,
    tripPage: 1,
    // 搜索条件
    searchParams: {
      village: '',
      departureTime: ''
    },
    // 我发布的行程
    myTripList: [],
    myTripLoading: false,
    // 我的预约列表
    myBookingList: [],
    myBookingLoading: false,
    // 当前查看的行程详情
    currentTrip: null
  }),

  getters: {
    // 有效行程（未过期、未满员）
    availableTrips: (state) => {
      return state.tripList.filter(trip => {
        return trip.status === 'active' || trip.status === 0
      })
    },
    // 我的待出行预约数
    pendingBookingCount: (state) => {
      return state.myBookingList.filter(b => {
        const status = b.status
        return status === 'confirmed' || status === 'pending' || status === 0 || status === 1
      }).length
    }
  },

  actions: {
    /**
     * 搜索顺风车行程（分页）
     * @param {boolean} refresh
     */
    async searchTrips(refresh = false) {
      if (this.tripLoading) return
      if (refresh) {
        this.tripPage = 1
        this.tripHasMore = true
        this.tripList = []
      }
      if (!this.tripHasMore) return

      this.tripLoading = true
      try {
        const pageSize = 10
        const skip = (this.tripPage - 1) * pageSize
        const res = await carpoolApi.getCarpoolTrips({
          ...this.searchParams,
          skip,
          take: pageSize
        })
        const list = Array.isArray(res) ? res : (res.list || res.items || [])
        if (list.length < pageSize) {
          this.tripHasMore = false
        }
        this.tripList = refresh ? list : [...this.tripList, ...list]
        this.tripPage += 1
      } catch (err) {
        console.error('[carpoolStore] searchTrips error:', err)
      } finally {
        this.tripLoading = false
      }
    },

    /**
     * 更新搜索条件并刷新
     * @param {Object} params { village, departureTime }
     */
    async updateSearch(params) {
      this.searchParams = { ...this.searchParams, ...params }
      await this.searchTrips(true)
    },

    /**
     * 加载行程详情
     * @param {string|number} id
     */
    async loadTripDetail(id) {
      try {
        const res = await carpoolApi.getCarpoolTripDetail(id)
        this.currentTrip = res
        return res
      } catch (err) {
        console.error('[carpoolStore] loadTripDetail error:', err)
        throw err
      }
    },

    /**
     * 发布行程
     * @param {Object} data
     */
    async publishTrip(data) {
      try {
        const res = await carpoolApi.publishTrip(data)
        // 刷新我的行程列表
        await this.loadMyTrips()
        return res
      } catch (err) {
        console.error('[carpoolStore] publishTrip error:', err)
        throw err
      }
    },

    /**
     * 加载我发布的行程
     */
    async loadMyTrips() {
      if (this.myTripLoading) return
      this.myTripLoading = true
      try {
        const res = await carpoolApi.getMyTrips()
        this.myTripList = Array.isArray(res) ? res : (res.list || res.items || [])
      } catch (err) {
        console.error('[carpoolStore] loadMyTrips error:', err)
      } finally {
        this.myTripLoading = false
      }
    },

    /**
     * 加载我的预约
     */
    async loadMyBookings() {
      if (this.myBookingLoading) return
      this.myBookingLoading = true
      try {
        const res = await carpoolApi.getMyBookings()
        this.myBookingList = Array.isArray(res) ? res : (res.list || res.items || [])
      } catch (err) {
        console.error('[carpoolStore] loadMyBookings error:', err)
      } finally {
        this.myBookingLoading = false
      }
    },

    /**
     * 预约行程
     * @param {string|number} tripId
     * @param {Object} data
     */
    async bookTrip(tripId, data) {
      try {
        const res = await carpoolApi.bookTrip(tripId, data)
        // 刷新我的预约
        await this.loadMyBookings()
        return res
      } catch (err) {
        console.error('[carpoolStore] bookTrip error:', err)
        throw err
      }
    },

    clearAll() {
      this.tripList = []
      this.myTripList = []
      this.myBookingList = []
      this.tripPage = 1
      this.tripHasMore = true
      this.currentTrip = null
      this.searchParams = { village: '', departureTime: '' }
    }
  }
})