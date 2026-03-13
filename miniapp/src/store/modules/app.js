import { defineStore } from 'pinia'

/**
 * 全局应用状态 store
 * 管理：全局 loading、toast、网络状态、页面返回标记等
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    // 全局 loading 计数（支持嵌套调用）
    loadingCount: 0,
    // 当前网络状态
    networkType: 'unknown', // wifi/2g/3g/4g/5g/unknown/none
    isNetworkConnected: true,
    // 系统信息（首次获取后缓存）
    systemInfo: null,
    // 页面刷新标记（用于跨页面通知刷新）
    refreshFlags: {
      orderList: false,
      productList: false,
      userProfile: false,
      allianceList: false,
      carpoolList: false
    },
    // 全局配置（可从后端拉取）
    config: {
      version: '1.0.0',
      contactPhone: '400-000-0000',
      serviceHours: '09:00-21:00'
    }
  }),

  getters: {
    isLoading: (state) => state.loadingCount > 0
  },

  actions: {
    /**
     * 显示全局 loading
     */
    showLoading(title = '加载中...') {
      this.loadingCount++
      if (this.loadingCount === 1) {
        uni.showLoading({ title, mask: true })
      }
    },

    /**
     * 隐藏全局 loading（支持嵌套）
     */
    hideLoading() {
      if (this.loadingCount > 0) {
        this.loadingCount--
      }
      if (this.loadingCount === 0) {
        uni.hideLoading()
      }
    },

    /**
     * 强制隐藏所有 loading
     */
    forceHideLoading() {
      this.loadingCount = 0
      uni.hideLoading()
    },

    /**
     * 显示 Toast
     * @param {string} title
     * @param {string} icon - success/error/loading/none
     * @param {number} duration
     */
    showToast(title, icon = 'none', duration = 2000) {
      uni.showToast({ title, icon, duration })
    },

    /**
     * 更新网络状态
     */
    setNetworkInfo({ networkType, isConnected }) {
      this.networkType = networkType
      this.isNetworkConnected = isConnected
    },

    /**
     * 初始化：获取系统信息、监听网络
     */
    init() {
      // 获取系统信息
      try {
        this.systemInfo = uni.getSystemInfoSync()
      } catch (e) {
        console.warn('[appStore] getSystemInfoSync failed:', e)
      }

      // 获取网络状态
      uni.getNetworkType({
        success: ({ networkType }) => {
          this.networkType = networkType
          this.isNetworkConnected = networkType !== 'none'
        }
      })

      // 监听网络变化
      uni.onNetworkStatusChange(({ networkType, isConnected }) => {
        this.setNetworkInfo({ networkType, isConnected })
        if (!isConnected) {
          this.showToast('网络已断开，请检查连接', 'none')
        }
      })
    },

    /**
     * 设置页面刷新标记
     * @param {string} key - refreshFlags 中的 key
     */
    setRefreshFlag(key) {
      if (key in this.refreshFlags) {
        this.refreshFlags[key] = true
      }
    },

    /**
     * 消费并清除刷新标记（页面 onShow 中调用）
     * @param {string} key
     * @returns {boolean} 是否需要刷新
     */
    consumeRefreshFlag(key) {
      if (this.refreshFlags[key]) {
        this.refreshFlags[key] = false
        return true
      }
      return false
    },

    setConfig(config) {
      this.config = { ...this.config, ...config }
    }
  }
  // 全局 app store 不需要持久化（状态随会话生命周期）
})