import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] // 购物车商品列表
  }),

  getters: {
    // 购物车商品总数
    totalCount: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    // 选中商品总数
    selectedCount: (state) => {
      return state.items.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0)
    },
    // 选中商品总价
    selectedAmount: (state) => {
      return state.items
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    },
    // 是否全选
    isAllSelected: (state) => {
      return state.items.length > 0 && state.items.every(item => item.selected)
    },
    // 选中的商品
    selectedItems: (state) => {
      return state.items.filter(item => item.selected)
    }
  },

  actions: {
    // 添加商品到购物车
    addItem(product) {
      const existItem = this.items.find(
        item => item.productId === product.productId && item.specId === product.specId
      )
      if (existItem) {
        existItem.quantity += product.quantity || 1
      } else {
        this.items.push({
          ...product,
          quantity: product.quantity || 1,
          selected: true
        })
      }
    },

    // 更新商品数量
    updateQuantity(index, quantity) {
      if (quantity <= 0) {
        this.items.splice(index, 1)
      } else {
        this.items[index].quantity = quantity
      }
    },

    // 移除商品
    removeItem(index) {
      this.items.splice(index, 1)
    },

    // 切换选中状态
    toggleSelect(index) {
      this.items[index].selected = !this.items[index].selected
    },

    // 全选/取消全选
    toggleSelectAll() {
      const allSelected = this.isAllSelected
      this.items.forEach(item => {
        item.selected = !allSelected
      })
    },

    // 清空购物车
    clearCart() {
      this.items = []
    },

    // 移除选中商品（下单后调用）
    removeSelected() {
      this.items = this.items.filter(item => !item.selected)
    }
  },

  persist: {
    key: 'xlxq_cart'
  }
})