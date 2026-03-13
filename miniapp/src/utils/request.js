import { useUserStore } from '@/store/modules/user'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005'

export const request = (options) => {
  return new Promise((resolve, reject) => {
    const userStore = useUserStore()
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': userStore.token ? `Bearer ${userStore.token}` : '',
        ...options.header
      },
      success: (res) => {
        const data = res.data
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data?.data ?? data)
        } else if (res.statusCode === 401 || data.code === 401) {
          userStore.logout()
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pages/auth/login'
          })
          reject(data)
        } else {
          uni.showToast({
            title: data.message || data.msg || '请求失败',
            icon: 'none'
          })
          reject(data)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request