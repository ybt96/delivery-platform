import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {
      id: '',
      nickname: '',
      phone: '',
      avatar: '',
      isCertified: false, // 是否实名认证
      roles: ['consumer'] // 角色列表：consumer, merchant, driver, stationmaster, admin
    },
    addresses: [] // 收货地址列表
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    defaultAddress: (state) => state.addresses.find(addr => addr.isDefault) || null,
    hasRole: (state) => (role) => state.userInfo.roles?.includes(role)
  },
  
  actions: {
    setToken(token) {
      this.token = token
    },
    
    setUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
    },
    
    setAddresses(addresses) {
      this.addresses = addresses
    },
    
    addAddress(address) {
      if (address.isDefault) {
        this.addresses.forEach(addr => addr.isDefault = false)
      }
      this.addresses.push(address)
    },
    
    updateAddress(address) {
      if (address.isDefault) {
        this.addresses.forEach(addr => addr.isDefault = false)
      }
      const index = this.addresses.findIndex(addr => addr.id === address.id)
      if (index !== -1) {
        this.addresses[index] = address
      }
    },
    
    removeAddress(id) {
      this.addresses = this.addresses.filter(addr => addr.id !== id)
    },
    
    logout() {
      this.token = ''
      this.userInfo = {
        id: '',
        nickname: '',
        phone: '',
        avatar: '',
        isCertified: false,
        roles: ['consumer']
      }
      this.addresses = []
    }
  },
  
  persist: {
    key: 'xlxq_user'
  }
})