/**
 * 本地存储工具类
 */

const STORAGE_PREFIX = 'xlxq_'

export const storage = {
  /**
   * 设置存储
   */
  set(key, value) {
    try {
      uni.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('存储失败:', e)
    }
  },

  /**
   * 获取存储
   */
  get(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(STORAGE_PREFIX + key)
      return value ? JSON.parse(value) : defaultValue
    } catch (e) {
      console.error('读取存储失败:', e)
      return defaultValue
    }
  },

  /**
   * 移除存储
   */
  remove(key) {
    try {
      uni.removeStorageSync(STORAGE_PREFIX + key)
    } catch (e) {
      console.error('移除存储失败:', e)
    }
  },

  /**
   * 清空所有存储
   */
  clear() {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('清空存储失败:', e)
    }
  }
}

// 具名导出函数（兼容部分页面的解构导入用法）
export const getStorage = (key, defaultValue = null) => storage.get(key, defaultValue)
export const setStorage = (key, value) => storage.set(key, value)
export const removeStorage = (key) => storage.remove(key)

export default storage