import { defineStore } from 'pinia'
import * as orderApi from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    // 订单列表缓存（按状态分组）
    orderList: [],
    currentPage: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    // 当前查看的订单详情
    currentOrder: null,
    // 当前筛选状态（all/pending/paid/shipped/completed/cancelled）
    filterStatus: 'all'
  }),

  getters: {
    // 按状态过滤后的订单列表
    filteredOrders: (state) => {
      if (state.filterStatus === 'all') return state.orderList
      return state.orderList.filter(o => o.status === state.filterStatus)
    },
    // 待付款订单数量
    pendingCount: (state) => {
      return state.orderList.filter(o => o.status === 'pending').length
    }
  },

  actions: {
    /**
     * 加载订单列表（自动分页）
     * @param {boolean} refresh 是否刷新（重置分页）
     */
    async loadOrders(refresh = false) {
      if (this.loading) return
      if (refresh) {
        this.currentPage = 1
        this.hasMore = true
        this.orderList = []
      }
      if (!this.hasMore) return

      this.loading = true
      try {
        const skip = (this.currentPage - 1) * this.pageSize
        const res = await orderApi.getMyOrders({ skip, take: this.pageSize })
        const list = Array.isArray(res) ? res : (res.list || res.items || [])
        if (list.length < this.pageSize) {
          this.hasMore = false
        }
        this.orderList = refresh ? list : [...this.orderList, ...list]
        this.currentPage += 1
      } catch (err) {
        console.error('[orderStore] loadOrders error:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载订单详情并缓存
     * @param {string|number} id
     */
    async loadOrderDetail(id) {
      try {
        const res = await orderApi.getOrderDetail(id)
        this.currentOrder = res
        return res
      } catch (err) {
        console.error('[orderStore] loadOrderDetail error:', err)
        throw err
      }
    },

    /**
     * 取消订单后更新本地状态
     * @param {string|number} id
     */
    async cancelOrder(id) {
      try {
        await orderApi.cancelOrder(id)
        const idx = this.orderList.findIndex(o => o.id === id)
        if (idx !== -1) {
          this.orderList[idx].status = 'cancelled'
        }
        if (this.currentOrder && this.currentOrder.id === id) {
          this.currentOrder.status = 'cancelled'
        }
      } catch (err) {
        console.error('[orderStore] cancelOrder error:', err)
        throw err
      }
    },

    setFilterStatus(status) {
      this.filterStatus = status
    },

    clearOrders() {
      this.orderList = []
      this.currentPage = 1
      this.hasMore = true
      this.currentOrder = null
    }
  }
})