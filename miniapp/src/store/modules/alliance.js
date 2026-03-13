import { defineStore } from 'pinia'
import * as allianceApi from '@/api/alliance'

export const useAllianceStore = defineStore('alliance', {
  state: () => ({
    // 可领取的优惠券列表
    couponList: [],
    couponLoading: false,
    couponHasMore: true,
    couponPage: 1,
    // 我的优惠券列表
    myCouponList: [],
    myCouponLoading: false,
    // 当前筛选（available/used/expired）
    myCouponFilter: 'available',
    // 联盟商家列表
    merchantList: [],
    merchantLoading: false
  }),

  getters: {
    // 可用优惠券数量（用于 badge 展示）
    availableCouponCount: (state) => {
      return state.myCouponList.filter(c => {
        const status = typeof c.status === 'number' ? c.status : 0
        // status: 0=未使用, 1=已使用, 2=已过期
        return status === 0
      }).length
    },
    // 按筛选条件过滤我的优惠券
    filteredMyCoupons: (state) => {
      return state.myCouponList.filter(c => {
        const status = typeof c.status === 'number' ? c.status : 0
        if (state.myCouponFilter === 'available') return status === 0
        if (state.myCouponFilter === 'used') return status === 1
        if (state.myCouponFilter === 'expired') return status === 2
        return true
      })
    }
  },

  actions: {
    /**
     * 加载可领取优惠券列表
     * @param {boolean} refresh
     */
    async loadCoupons(refresh = false) {
      if (this.couponLoading) return
      if (refresh) {
        this.couponPage = 1
        this.couponHasMore = true
        this.couponList = []
      }
      if (!this.couponHasMore) return

      this.couponLoading = true
      try {
        const pageSize = 10
        const skip = (this.couponPage - 1) * pageSize
        const res = await allianceApi.getCoupons({ skip, take: pageSize })
        const list = Array.isArray(res) ? res : (res.list || res.items || [])
        if (list.length < pageSize) {
          this.couponHasMore = false
        }
        this.couponList = refresh ? list : [...this.couponList, ...list]
        this.couponPage += 1
      } catch (err) {
        console.error('[allianceStore] loadCoupons error:', err)
      } finally {
        this.couponLoading = false
      }
    },

    /**
     * 加载我的优惠券
     */
    async loadMyCoupons() {
      if (this.myCouponLoading) return
      this.myCouponLoading = true
      try {
        const res = await allianceApi.getMyCoupons()
        this.myCouponList = Array.isArray(res) ? res : (res.list || res.items || [])
      } catch (err) {
        console.error('[allianceStore] loadMyCoupons error:', err)
      } finally {
        this.myCouponLoading = false
      }
    },

    /**
     * 领取优惠券并刷新列表
     * @param {string|number} couponId
     */
    async claimCoupon(couponId) {
      try {
        await allianceApi.claimCoupon(couponId)
        // 更新本地可领取列表中该券的状态
        const idx = this.couponList.findIndex(c => c.id === couponId)
        if (idx !== -1) {
          this.couponList[idx].isClaimed = true
        }
        // 刷新我的券包
        await this.loadMyCoupons()
      } catch (err) {
        console.error('[allianceStore] claimCoupon error:', err)
        throw err
      }
    },

    setMyCouponFilter(filter) {
      this.myCouponFilter = filter
    },

    clearAll() {
      this.couponList = []
      this.myCouponList = []
      this.merchantList = []
      this.couponPage = 1
      this.couponHasMore = true
    }
  }
})