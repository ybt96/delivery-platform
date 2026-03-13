<template>
  <view class="confirm-page">
    <!-- 收货地址 -->
    <view class="address-section" @click="chooseAddress">
      <view class="address-content" v-if="currentAddress">
        <view class="location-icon">📍</view>
        <view class="info">
          <view class="user">
            <text class="name">{{ currentAddress.name }}</text>
            <text class="phone">{{ currentAddress.phone }}</text>
            <text v-if="currentAddress.tag" class="tag">{{ currentAddress.tag }}</text>
          </view>
          <text class="detail">{{ currentAddress.province }}{{ currentAddress.city }}{{ currentAddress.district }}{{ currentAddress.detail }}</text>
        </view>
        <view class="arrow">›</view>
      </view>
      <view class="empty-address" v-else>
        <text class="add-icon">+</text>
        <text>请添加收货地址</text>
        <view class="arrow">›</view>
      </view>
      <view class="border-line"></view>
    </view>
    
    <!-- 商品列表 -->
    <view class="shop-group" v-for="(group, shopId) in orderGrouped" :key="shopId">
      <view class="shop-header">
        <text class="shop-icon">🏪</text>
        <text class="shop-name">{{ group.shopName || '平台直营' }}</text>
      </view>
      
      <view class="goods-item" v-for="item in group.items" :key="item.id || item.productId">
        <image class="goods-img" :src="item.image || '/static/images/default-img.png'" mode="aspectFill" />
        <view class="goods-info">
          <text class="name">{{ item.name }}</text>
          <text class="spec" v-if="item.specText">{{ item.specText }}</text>
          <view class="price-row">
            <text class="price">¥{{ item.price }}</text>
            <text class="quantity">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
      
      <view class="form-row">
        <text class="label">配送方式</text>
        <text class="value">乡里乡亲配送 (免运费)</text>
      </view>
      
      <view class="form-row">
        <text class="label">买家留言</text>
        <input class="input" v-model="group.remark" placeholder="建议留言前先与商家沟通确认" />
      </view>
      
      <view class="shop-total">
        <text>共 {{ group.totalQuantity }} 件，</text>
        <text>小计：</text>
        <text class="price">¥{{ group.totalAmount.toFixed(2) }}</text>
      </view>
    </view>
    
    <!-- 订单金额信息 -->
    <view class="amount-section">
      <view class="amount-row">
        <text class="label">商品总价</text>
        <text class="value">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="amount-row">
        <text class="label">配送费</text>
        <text class="value">+ ¥0.00</text>
      </view>
      <view class="amount-row" v-if="allianceDiscount > 0">
        <text class="label">联盟优惠</text>
        <text class="value discount">- ¥{{ allianceDiscount.toFixed(2) }}</text>
      </view>
      <view class="amount-row total">
        <text class="label">应付金额</text>
        <text class="price">¥{{ finalAmount.toFixed(2) }}</text>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar safe-bottom">
      <view class="total-info">
        <text class="label">实付款：</text>
        <text class="price">¥{{ finalAmount.toFixed(2) }}</text>
      </view>
      <button class="btn-submit" @click="submitOrder">提交订单</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { useCartStore } from '@/store/modules/cart'
import { createOrder } from '@/api/order'

const userStore = useUserStore()
const cartStore = useCartStore()

const { addresses } = storeToRefs(userStore)
const currentAddress = ref(null)
const orderItems = ref([])
const isFromCart = ref(false)

// 按店铺分组订单数据
const orderGrouped = computed(() => {
  const groups = {}
  orderItems.value.forEach(item => {
    const shopId = item.shopId || 'platform'
    if (!groups[shopId]) {
      groups[shopId] = {
        shopName: item.shopName,
        items: [],
        remark: '',
        totalQuantity: 0,
        totalAmount: 0
      }
    }
    groups[shopId].items.push(item)
    groups[shopId].totalQuantity += item.quantity
    groups[shopId].totalAmount += item.price * item.quantity
  })
  return groups
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const allianceDiscount = ref(0) // 模拟联盟优惠

const finalAmount = computed(() => {
  return Math.max(0, totalAmount.value - allianceDiscount.value)
})

onLoad((options) => {
  if (options.items) {
    try {
      orderItems.value = JSON.parse(decodeURIComponent(options.items))
      // 简单判断是否来自购物车 (根据选中的商品数量和购物车选中数量是否一致)
      // 严谨点可以通过路由参数明确传递
      isFromCart.value = orderItems.value.length > 0 && orderItems.value[0].hasOwnProperty('selected')
    } catch (e) {
      console.error('解析订单商品失败', e)
    }
  }
  
  // 设置默认地址
  setDefaultAddress()
  
  // 监听地址选择事件
  uni.$on('selectAddress', (address) => {
    currentAddress.value = address
  })
})

onUnmounted(() => {
  uni.$off('selectAddress')
})

const setDefaultAddress = () => {
  if (addresses.value.length > 0) {
    const defaultAddr = addresses.value.find(addr => addr.isDefault)
    currentAddress.value = defaultAddr || addresses.value[0]
  }
}

const chooseAddress = () => {
  uni.navigateTo({
    url: '/pages/user/address-list?select=true'
  })
}

const submitOrder = async () => {
  if (!currentAddress.value) {
    return uni.showToast({ title: '请选择收货地址', icon: 'none' })
  }
  
  if (orderItems.value.length === 0) {
    return uni.showToast({ title: '订单异常', icon: 'none' })
  }
  
  try {
    uni.showLoading({ title: '提交中...', mask: true })
    
    // 构建请求参数
    const orderData = {
      addressId: currentAddress.value.id,
      items: orderItems.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        specId: item.specId
      })),
      // 提取每个店铺的留言
      remarks: Object.keys(orderGrouped.value).reduce((acc, shopId) => {
        acc[shopId] = orderGrouped.value[shopId].remark
        return acc
      }, {})
    }
    
    // 实际调用接口
    // const res = await createOrder(orderData)
    // const orderId = res.id
    
    // 模拟接口延迟和返回
    await new Promise(resolve => setTimeout(resolve, 1000))
    const orderId = 'MOCK_' + Date.now()
    
    // 如果是从购物车来的，清除购物车中已选中的商品
    if (isFromCart.value) {
      cartStore.removeSelected()
    }
    
    uni.hideLoading()
    
    // 模拟支付成功
    uni.showModal({
      title: '模拟支付',
      content: `需支付 ¥${finalAmount.value.toFixed(2)}`,
      confirmText: '确认支付',
      cancelText: '取消支付',
      success: (res) => {
        if (res.confirm) {
          uni.redirectTo({ url: `/pages/order/detail?id=${orderId}` })
        } else {
          // 跳转到订单列表待付款
          uni.redirectTo({ url: '/pages/order/list?status=pending_payment' })
        }
      }
    })
    
  } catch (error) {
    console.error('提交订单失败', error)
    uni.hideLoading()
    uni.showToast({ title: '提交订单失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.confirm-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 120rpx;
}

// 地址选择
.address-section {
  background-color: #fff;
  margin-bottom: $spacing-sm;
  position: relative;
  
  .address-content {
    display: flex;
    align-items: center;
    padding: $spacing-base;
    
    .location-icon {
      font-size: 40rpx;
      margin-right: $spacing-sm;
    }
    
    .info {
      flex: 1;
      
      .user {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .name {
          font-size: $font-size-md;
          font-weight: bold;
          margin-right: $spacing-sm;
        }
        
        .phone {
          font-size: $font-size-base;
          color: $text-regular;
          margin-right: $spacing-sm;
        }
        
        .tag {
          @include tag($info-color);
        }
      }
      
      .detail {
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.4;
      }
    }
  }
  
  .empty-address {
    display: flex;
    align-items: center;
    padding: $spacing-lg $spacing-base;
    font-size: $font-size-base;
    color: $primary-color;
    
    .add-icon {
      font-size: 40rpx;
      margin-right: 12rpx;
    }
    
    .arrow {
      margin-left: auto;
      color: $text-secondary;
    }
  }
  
  .arrow {
    font-size: 32rpx;
    color: $text-placeholder;
    margin-left: $spacing-sm;
  }
  
  .border-line {
    height: 6rpx;
    background: repeating-linear-gradient(-45deg, #ff6c6c 0, #ff6c6c 20%, transparent 0, transparent 25%, #1989fa 0, #1989fa 45%, transparent 0, transparent 50%);
    background-size: 160rpx;
  }
}

// 商品列表
.shop-group {
  background-color: #fff;
  border-radius: $radius-base;
  margin: $spacing-sm;
  padding: $spacing-base;
  
  .shop-header {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-base;
    
    .shop-icon {
      font-size: 32rpx;
      margin-right: 8rpx;
    }
    
    .shop-name {
      font-size: $font-size-base;
      font-weight: bold;
    }
  }
  
  .goods-item {
    display: flex;
    margin-bottom: $spacing-base;
    
    .goods-img {
      width: 140rpx;
      height: 140rpx;
      border-radius: $radius-sm;
      margin-right: $spacing-sm;
      background-color: $bg-gray;
    }
    
    .goods-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .name {
        font-size: $font-size-sm;
        color: $text-primary;
        @include ellipsis(2);
      }
      
      .spec {
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-top: 8rpx;
        background-color: $bg-gray;
        padding: 4rpx 12rpx;
        border-radius: $radius-sm;
        align-self: flex-start;
      }
      
      .price-row {
        margin-top: auto;
        @include flex-between;
        
        .price {
          font-size: $font-size-md;
          font-weight: bold;
          color: $price-color;
        }
        
        .quantity {
          font-size: $font-size-sm;
          color: $text-regular;
        }
      }
    }
  }
  
  .form-row {
    display: flex;
    align-items: center;
    padding: $spacing-sm 0;
    
    .label {
      width: 140rpx;
      font-size: $font-size-sm;
      color: $text-regular;
    }
    
    .value {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-primary;
      text-align: right;
    }
    
    .input {
      flex: 1;
      font-size: $font-size-sm;
    }
  }
  
  .shop-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: $spacing-sm;
    margin-top: $spacing-sm;
    border-top: 1rpx solid $border-light;
    font-size: $font-size-sm;
    color: $text-regular;
    
    .price {
      font-size: $font-size-md;
      font-weight: bold;
      color: $price-color;
    }
  }
}

// 金额明细
.amount-section {
  background-color: #fff;
  border-radius: $radius-base;
  margin: $spacing-sm;
  padding: $spacing-base;
  
  .amount-row {
    @include flex-between;
    margin-bottom: $spacing-sm;
    font-size: $font-size-sm;
    color: $text-regular;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .value {
      color: $text-primary;
      
      &.discount {
        color: $price-color;
      }
    }
    
    &.total {
      margin-top: $spacing-base;
      padding-top: $spacing-sm;
      border-top: 1rpx solid $border-light;
      
      .label {
        font-size: $font-size-base;
        color: $text-primary;
        font-weight: bold;
      }
      
      .price {
        font-size: $font-size-lg;
        color: $price-color;
        font-weight: bold;
      }
    }
  }
}

// 底部栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 $spacing-base;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .total-info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: $spacing-base;
    
    .label {
      font-size: $font-size-sm;
      color: $text-regular;
    }
    
    .price {
      font-size: $font-size-lg;
      color: $price-color;
      font-weight: bold;
    }
  }
  
  .btn-submit {
    width: 240rpx;
    height: 72rpx;
    line-height: 72rpx;
    background-color: $primary-color;
    color: #fff;
    font-size: $font-size-base;
    border-radius: 36rpx;
    margin: 0;
    
    &::after { border: none; }
  }
}
</style>