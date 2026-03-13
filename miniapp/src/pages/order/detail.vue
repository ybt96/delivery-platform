<template>
  <view class="order-detail-page">
    <!-- 订单状态 -->
    <view class="status-header" :class="order.statusClass">
      <text class="status-icon">{{ statusIcon }}</text>
      <view class="status-info">
        <text class="status-text">{{ order.statusText }}</text>
        <text class="status-desc">{{ statusDesc }}</text>
      </view>
    </view>
    
    <!-- 配送信息 -->
    <view class="section address-section" v-if="order.address">
      <text class="section-icon">📍</text>
      <view class="address-info">
        <view class="user">
          <text class="name">{{ order.address.name }}</text>
          <text class="phone">{{ order.address.phone }}</text>
        </view>
        <text class="detail">{{ order.address.fullAddress }}</text>
      </view>
    </view>
    
    <!-- 配送追踪 (仅配送中显示) -->
    <view class="section track-section" v-if="order.status === 'delivering'" @click="viewTrack">
      <text class="section-icon">🚚</text>
      <view class="track-info">
        <text class="track-text">{{ order.trackInfo || '配送员正在赶来的路上...' }}</text>
        <text class="track-time">{{ order.trackTime || '' }}</text>
      </view>
      <text class="arrow">›</text>
    </view>
    
    <!-- 商品列表 -->
    <view class="section goods-section">
      <view class="shop-header">
        <text class="shop-icon">🏪</text>
        <text class="shop-name">{{ order.shopName || '平台直营' }}</text>
      </view>
      
      <view class="goods-item" v-for="item in order.items" :key="item.id" @click="goProduct(item.productId)">
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
    </view>
    
    <!-- 订单金额明细 -->
    <view class="section amount-section">
      <view class="amount-row">
        <text class="label">商品总额</text>
        <text class="value">¥{{ order.goodsAmount }}</text>
      </view>
      <view class="amount-row">
        <text class="label">配送费</text>
        <text class="value">¥{{ order.deliveryFee || '0.00' }}</text>
      </view>
      <view class="amount-row" v-if="order.discount">
        <text class="label">优惠减免</text>
        <text class="value discount">-¥{{ order.discount }}</text>
      </view>
      <view class="amount-row total">
        <text class="label">实付金额</text>
        <text class="total-price">¥{{ order.totalAmount }}</text>
      </view>
    </view>
    
    <!-- 订单信息 -->
    <view class="section info-section">
      <view class="info-title">订单信息</view>
      <view class="info-row">
        <text class="label">订单编号</text>
        <text class="value" @click="copyOrderNo">{{ order.orderNo }} 复制</text>
      </view>
      <view class="info-row">
        <text class="label">下单时间</text>
        <text class="value">{{ order.createTime }}</text>
      </view>
      <view class="info-row" v-if="order.payTime">
        <text class="label">付款时间</text>
        <text class="value">{{ order.payTime }}</text>
      </view>
      <view class="info-row" v-if="order.deliveryTime">
        <text class="label">发货时间</text>
        <text class="value">{{ order.deliveryTime }}</text>
      </view>
      <view class="info-row" v-if="order.completeTime">
        <text class="label">完成时间</text>
        <text class="value">{{ order.completeTime }}</text>
      </view>
      <view class="info-row" v-if="order.remark">
        <text class="label">买家留言</text>
        <text class="value">{{ order.remark }}</text>
      </view>
    </view>
    
    <!-- 底部操作 -->
    <view class="bottom-bar safe-bottom" v-if="showBottomBar">
      <!-- 待付款 -->
      <template v-if="order.status === 'pending_payment'">
        <button class="btn-normal" @click="handleCancel">取消订单</button>
        <button class="btn-primary" @click="handlePay">立即付款</button>
      </template>
      
      <!-- 待发货 -->
      <template v-else-if="order.status === 'pending_delivery'">
        <button class="btn-normal" @click="contactShop">联系商家</button>
        <button class="btn-normal" @click="handleRefund">申请退款</button>
      </template>
      
      <!-- 配送中 -->
      <template v-else-if="order.status === 'delivering'">
        <button class="btn-normal" @click="handleRefund">申请退款</button>
        <button class="btn-primary" @click="handleConfirm">确认收货</button>
      </template>
      
      <!-- 待评价 -->
      <template v-else-if="order.status === 'pending_comment'">
        <button class="btn-primary" @click="handleEvaluate">去评价</button>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, cancelOrder, confirmOrder, refundOrder } from '@/api/order'

const orderId = ref('')
const order = ref({
  id: '',
  orderNo: '',
  status: '',
  statusText: '',
  statusClass: '',
  shopName: '',
  items: [],
  address: null,
  goodsAmount: '0.00',
  deliveryFee: '0.00',
  discount: '',
  totalAmount: '0.00',
  createTime: '',
  payTime: '',
  deliveryTime: '',
  completeTime: '',
  remark: '',
  trackInfo: '',
  trackTime: ''
})

const statusMap = {
  pending_payment: { text: '待付款', class: 'pending', icon: '💳', desc: '请在30分钟内完成付款' },
  pending_delivery: { text: '待发货', class: 'pending', icon: '📦', desc: '商家正在准备商品' },
  delivering: { text: '配送中', class: 'delivering', icon: '🚚', desc: '配送员正在送货途中' },
  pending_comment: { text: '待评价', class: 'completed', icon: '💬', desc: '已完成，期待您的评价' },
  completed: { text: '已完成', class: 'completed', icon: '✅', desc: '感谢您的惠顾' },
  cancelled: { text: '已取消', class: 'cancelled', icon: '❌', desc: '订单已取消' }
}

const statusIcon = computed(() => statusMap[order.value.status]?.icon || '📋')
const statusDesc = computed(() => statusMap[order.value.status]?.desc || '')
const showBottomBar = computed(() => ['pending_payment', 'pending_delivery', 'delivering', 'pending_comment'].includes(order.value.status))

onLoad(async (options) => {
  if (options.id) {
    orderId.value = options.id
    await fetchDetail()
  }
})

const fetchDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getOrderDetail(orderId.value)
    
    const statusInfo = statusMap[res.status] || {}
    order.value = {
      ...res,
      statusText: statusInfo.text || res.status,
      statusClass: statusInfo.class || ''
    }
  } catch (error) {
    console.error('获取订单详情失败', error)
    // 使用模拟数据
    order.value = {
      id: orderId.value,
      orderNo: orderId.value,
      status: 'delivering',
      statusText: '配送中',
      statusClass: 'delivering',
      shopName: '乡里乡亲自营',
      items: [
        { id: '1', name: '模拟商品名称', image: '', price: '25.00', quantity: 2, specText: '规格：500g' }
      ],
      address: {
        name: '张三',
        phone: '13800138000',
        fullAddress: '浙江省 杭州市 西湖区 某某村1号'
      },
      goodsAmount: '50.00',
      deliveryFee: '0.00',
      discount: '',
      totalAmount: '50.00',
      createTime: '2026-03-10 14:30',
      payTime: '2026-03-10 14:31',
      deliveryTime: '2026-03-10 15:00',
      remark: '',
      trackInfo: '配送员小王正在送货途中',
      trackTime: '5分钟前'
    }
  } finally {
    uni.hideLoading()
  }
}

const copyOrderNo = () => {
  uni.setClipboardData({
    data: order.value.orderNo,
    success: () => uni.showToast({ title: '已复制', icon: 'success' })
  })
}

const handleCancel = () => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(orderId.value, '不想买了')
          uni.showToast({ title: '已取消', icon: 'success' })
          fetchDetail()
        } catch (e) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

const handlePay = () => {
  uni.showToast({ title: '调起支付...', icon: 'none' })
}

const handleConfirm = () => {
  uni.showModal({
    title: '确认收货',
    content: '请确认已收到商品',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmOrder(orderId.value)
          uni.showToast({ title: '已确认收货', icon: 'success' })
          fetchDetail()
        } catch (e) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const handleRefund = () => {
  uni.showToast({ title: '退款功能开发中', icon: 'none' })
}

const handleEvaluate = () => {
  uni.showToast({ title: '评价功能开发中', icon: 'none' })
}

const contactShop = () => {
  uni.makePhoneCall({ phoneNumber: '400-123-4567' })
}

const viewTrack = () => {
  uni.showToast({ title: '物流追踪开发中', icon: 'none' })
}

const goProduct = (productId) => {
  if (productId) {
    uni.navigateTo({ url: `/pages/product/detail?id=${productId}` })
  }
}
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 120rpx;
}

// 状态头部
.status-header {
  display: flex;
  align-items: center;
  padding: $spacing-lg $spacing-base;
  color: #fff;
  
  &.pending { background: linear-gradient(135deg, $secondary-color, $secondary-light); }
  &.delivering { background: linear-gradient(135deg, $info-color, #64b5f6); }
  &.completed { background: linear-gradient(135deg, $primary-color, $primary-light); }
  &.cancelled { background: linear-gradient(135deg, #999, #bbb); }
  
  .status-icon {
    font-size: 64rpx;
    margin-right: $spacing-base;
  }
  
  .status-info {
    display: flex;
    flex-direction: column;
    
    .status-text {
      font-size: $font-size-xl;
      font-weight: bold;
      margin-bottom: 8rpx;
    }
    
    .status-desc {
      font-size: $font-size-sm;
      opacity: 0.9;
    }
  }
}

// 通用 section
.section {
  @include card;
}

// 地址区域
.address-section {
  display: flex;
  align-items: flex-start;
  
  .section-icon {
    font-size: 36rpx;
    margin-right: $spacing-sm;
    margin-top: 4rpx;
  }
  
  .address-info {
    flex: 1;
    
    .user {
      margin-bottom: 8rpx;
      
      .name {
        font-size: $font-size-md;
        font-weight: bold;
        margin-right: $spacing-sm;
      }
      
      .phone {
        font-size: $font-size-base;
        color: $text-regular;
      }
    }
    
    .detail {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.4;
    }
  }
}

// 配送追踪
.track-section {
  display: flex;
  align-items: center;
  
  .section-icon {
    font-size: 36rpx;
    margin-right: $spacing-sm;
  }
  
  .track-info {
    flex: 1;
    
    .track-text {
      font-size: $font-size-sm;
      color: $text-primary;
    }
    
    .track-time {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-top: 4rpx;
    }
  }
  
  .arrow {
    color: $text-placeholder;
    font-size: 32rpx;
  }
}

// 商品区域
.goods-section {
  .shop-header {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-base;
    
    .shop-icon {
      font-size: 28rpx;
      margin-right: 8rpx;
    }
    
    .shop-name {
      font-size: $font-size-base;
      font-weight: bold;
    }
  }
  
  .goods-item {
    display: flex;
    margin-bottom: $spacing-sm;
    
    &:last-child { margin-bottom: 0; }
    
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
      }
      
      .price-row {
        margin-top: auto;
        @include flex-between;
        
        .price { font-weight: bold; }
        .quantity { color: $text-secondary; font-size: $font-size-xs; }
      }
    }
  }
}

// 金额明细
.amount-section {
  .amount-row {
    @include flex-between;
    margin-bottom: $spacing-sm;
    font-size: $font-size-sm;
    
    .label { color: $text-regular; }
    .value { color: $text-primary; }
    .discount { color: $price-color; }
    
    &.total {
      margin-top: $spacing-base;
      padding-top: $spacing-sm;
      border-top: 1rpx solid $border-light;
      
      .label {
        font-size: $font-size-base;
        font-weight: bold;
        color: $text-primary;
      }
      
      .total-price {
        font-size: $font-size-xl;
        color: $price-color;
        font-weight: bold;
      }
    }
  }
}

// 订单信息
.info-section {
  .info-title {
    font-size: $font-size-md;
    font-weight: bold;
    margin-bottom: $spacing-base;
  }
  
  .info-row {
    @include flex-between;
    margin-bottom: $spacing-sm;
    font-size: $font-size-sm;
    
    .label { color: $text-secondary; }
    .value { color: $text-regular; }
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 $spacing-base;
  gap: $spacing-sm;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  button {
    height: 64rpx;
    line-height: 64rpx;
    padding: 0 32rpx;
    font-size: $font-size-sm;
    border-radius: 32rpx;
    margin: 0;
    
    &::after { border: none; }
  }
  
  .btn-normal {
    background-color: #fff;
    color: $text-regular;
    border: 1rpx solid $border-color;
  }
  
  .btn-primary {
    background-color: $primary-color;
    color: #fff;
  }
}
</style>