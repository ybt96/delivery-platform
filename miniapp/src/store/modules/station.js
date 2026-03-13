import { defineStore } from 'pinia'
import * as stationApi from '@/api/station'

export const useStationStore = defineStore('station', {
  state: () => ({
    // 服务站列表
    stationList: [],
    stationLoading: false,
    // 当前查看的服务站详情
    currentStation: null,
    // 代购订单列表
    purchaseOrders: [],
    purchaseOrderLoading: false,
    purchaseOrderHasMore: true,
    purchaseOrderPage: 1,
    // 当前代购订单详情
    currentPurchaseOrder: null
  }),

  getters: {
    // 进行中的代购订单数
    activePurchaseCount: (state) => {
      return state.purchaseOrders.filter(o => {
        return o.status === 'pending' || o.status === 'processing' || o.status === 0 || o.status === 1
      }).length
    }
  },

  actions: {
    /**
     * 加载服务站列表
     * @param {Object} params
     */
    async loadStations(params = {}) {
      if (this.stationLoading) return
      this.stationLoading = true
      try {
        const res = await stationApi.getStations(params)
        this.stationList = Array.isArray(res)
          ? res
          : (res.data || res.list || res.items || [])
      } catch (err) {
        console.error('[stationStore] loadStations error:', err)
        // 后端暂无此接口，静默失败
        this.stationList = []
      } finally {
        this.stationLoading = false
      }
    },

    /**
     * 加载服务站详情
     * @param {string|number} id
     */
    async loadStationDetail(id) {
      try {
        const res = await stationApi.getStationDetail(id)
        const station = res?.data || res
        this.currentStation = station
        return station
      } catch (err) {
        console.error('[stationStore] loadStationDetail error:', err)
        throw err
      }
    },

    /**
     * 创建代购订单
     * @param {Object} data
     */
    async createPurchaseOrder(data) {
      try {
        const res = await stationApi.createPurchaseOrder(data)
        // 刷新代购订单列表
        await this.loadPurchaseOrders(true)
        return res
      } catch (err) {
        console.error('[stationStore] createPurchaseOrder error:', err)
        throw err
      }
    },

    /**
     * 加载代购订单列表（分页）
     * @param {boolean} refresh
     */
    async loadPurchaseOrders(refresh = false) {
      if (this.purchaseOrderLoading) return
      if (refresh) {
        this.purchaseOrderPage = 1
        this.purchaseOrderHasMore = true
        this.purchaseOrders = []
      }
      if (!this.purchaseOrderHasMore) return

      this.purchaseOrderLoading = true
      try {
        const pageSize = 10
        const skip = (this.purchaseOrderPage - 1) * pageSize
        const res = await stationApi.getPurchaseOrders({ skip, take: pageSize })
        const list = Array.isArray(res)
          ? res
          : (res.data || res.list || res.items || [])
        if (list.length < pageSize) {
          this.purchaseOrderHasMore = false
        }
        this.purchaseOrders = refresh ? list : [...this.purchaseOrders, ...list]
        this.purchaseOrderPage += 1
      } catch (err) {
        console.error('[stationStore] loadPurchaseOrders error:', err)
        // 后端暂无此接口，静默失败
        this.purchaseOrders = []
        this.purchaseOrderHasMore = false
      } finally {
        this.purchaseOrderLoading = false
      }
    },

    setCurrentStation(station) {
      this.currentStation = station
    },

    clearAll() {
      this.stationList = []
      this.currentStation = null
      this.purchaseOrders = []
      this.purchaseOrderPage = 1
      this.purchaseOrderHasMore = true
      this.currentPurchaseOrder = null
    }
  }
})