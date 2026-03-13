
<template>
  <view class="order-list-page">
    <!-- 状态 Tab -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === tab.value }"
        v-for="tab in tabs" 
        :key="tab.value"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
        <view class="indicator" v-if="currentTab === tab.value"></view>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <scroll-view class="order-list" scroll-y @scrolltolower="loadMore">
      <view class="order-card" v-for="order in orderList" :key="order.id" @click="goDetail(order.id)">
        <!-- 订单头 -->
        <view class="order-header">
          <view class="shop-info">
            <text class="shop-icon">🏪</text>
            <text class="shop-name">{{ order.shopName || '平台订单' }}</text>
          </view>
          <text class="status" :class="order.statusClass">{{ order.statusText }}</text>
        </view>
        
        <!-- 商品信息 -->
        <view class="goods-list">
          <view class="goods-item" v-for="item in order.items" :key="item.id">
            <image class="goods-img" :src="item.image" mode="aspectFill" />
            <view class="goods-info">
              <text class="name">{{ item.name }}</text>
              <text class="spec" v-if="item.specText">{{ item.specText }}</text>
            </view>
            <view class="price-info">
              <text class="price">¥{{ item.price }}</text>
              <text class="quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
        
        <!-- 订单金额 -->
        <view class="order-amount">
          <text>共{{ order.totalQuantity }}件，实付</text>
          <text class="amount">¥{{ order.totalAmount }}</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="order-actions">
          <!-- 待付款 -->
          <template v-if="order.status === 'pending_payment'">
            <button class="btn-normal" @click.stop="cancelOrder(order.id)">取消订单</button>
            <button class="btn-primary" @click.stop="payOrder(order.id)">去付款</button>
          </template>
          
          <!-- 待发货 -->
          <template v-else-if="order.status === 'pending_delivery'">
            <button class="btn-normal" @click.stop="contactShop(order)">联系商家</button>
          </template>
          
          <!-- 配送中 -->
          <template v-else-if="order.status === 'delivering'">
            <button class="btn-normal" @click.stop="viewTrack(order.id)">查看物流</button>
            <button class="btn-primary" @click.stop="confirmReceive(order.id)">确认收货</button>
          </template>
          
          <!-- 待评价 -->
          <template v-else-if="order.status === 'pending_comment'">
            <button class="btn-primary" @click.stop="goEvaluate(order.id)">去评价</button>
          </template>
          
          <!-- 已完成/已取消 -->
          <template v-else>
            <button class="btn-normal" @click.stop="goDetail(order.id)">查看详情</button>
            <button class="btn-normal" @click.stop="rebuy(order)">再次购买</button>
          </template>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-more"><text>加载中...</text></view>
      <view v-if="!loading && noMore && orderList.length > 0" class="no-more"><text>没有更多了</text></view>
      <Empty v-if="!loading && orderList.length === 0" text="暂无订单" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrders, cancelOrder as apiCancelOrder, confirmOrder } from '@/api/order'

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'pending_delivery' },
  { label: '配送中', value: 'delivering' },
  { label: '待评价', value: 'pending_comment' }
]

const statusMap = {
  pending_payment: { text: '待付款', class: 'pending' },
  pending_delivery: { text: '待发货', class: 'pending' },
  delivering: { text: '配送中', class: 'delivering' },
  pending_comment: { text: '待评价', class: 'completed' },
  completed: { text: '已完成', class: 'completed' },
  cancelled: { text: '已取消', class: 'cancelled' },
  0: { text: '待付款', class: 'pending' },
  1: { text: '待发货', class: 'pending' },
  2: { text: '配送中', class: 'delivering' },
  3: { text: '待评价', class: 'completed' },
  4: { text: '已完成', class: 'completed' },
  5: { text: '已取消', class: 'cancelled' }
}

const tabStatusMap = {
  '': undefined,
  pending_payment: 0,
  pending_delivery: 1,
  delivering: 2,
  pending_comment: 3
}

const currentTab = ref('')
const orderList = ref([])
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)

onLoad((options) => {
  if (options.status) {
    currentTab.value = options.status
  }
  fetchOrders()
})

const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  page.value = 1
  noMore.value = false
  orderList.value = []
  fetchOrders()
}

const fetchOrders = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  
  try {
    const pageSize = 10
    const skip = (page.value - 1) * pageSize
    const res = await getOrders({
      status: tabStatusMap[currentTab.value],
      skip,
      take: pageSize
    })
    
    const rawList = Array.isArray(res) ? (res[0] || []) : (res.list || res.items || [])
    const total = Array.isArray(res) ? Number(res[1] || 0) : Number(res.total || 0)

    const list = rawList.map(order => ({
      ...order,
      statusText: statusMap[order.status]?.text || order.status,
      statusClass: statusMap[order.status]?.class || ''
    }))
    
    orderList.value = [...orderList.value, ...list]
    
    if (list.length < pageSize || (total > 0 && orderList.value.length >= total)) {
      noMore.value = true
    }
    page.value++
  } catch (error) {
    console.error('获取订单失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!noMore.value && !loading.value) {
    fetchOrders()
  }
}

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

const cancelOrder = (id) => {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiCancelOrder(id, '不想买了')
          uni.showToast({ title: '已取消', icon: 'success' })
          refreshList()
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

const payOrder = (id) => {
  uni.showToast({ title: '跳转支付...', icon: 'none' })
  // 实际项目调起支付
}

const confirmReceive = (id) => {
  uni.showModal({
    title: '确认收货',
    content: '请确认已收到商品',
    success: async (res) => {
      if (res.confirm) {
        try {
          await confirmOrder(id)
          uni.showToast({ title: '已确认', icon: 'success' })
          refreshList()
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const viewTrack = (id) => {
  uni.showToast({ title: '查看物流...', icon: 'none' })
}

const contactShop = (order) => {
  uni.makePhoneCall({ phoneNumber: '400-123-4567' })
}

const goEvaluate = (id) => {
  uni.navigateTo({ url: `/pages/order/review?id=${id}` })
}

const rebuy = (order) => {
  uni.showToast({ title: '已加入购物车', icon: 'none' })
}

const refreshList = () => {
  page.value = 1
  noMore.value = false
  orderList.value = []
  fetchOrders()
}
</script>

<style lang="scss" scoped>
.order-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
}

// Tab 栏
.tab-bar {
  display: flex;
  background-color: #fff;
  height: 88rpx;
  
  .tab-item {
    flex: 1;
    @include flex-center;
    position: relative;
    font-size: $font-size-base;
    color: $text-regular;
    
    &.active {
      color: $primary-color;
      font-weight: bold;
    }
    
    .indicator {
      position: absolute;
      bottom: 4rpx;
      width: 40rpx;
      height: 4rpx;
      background-color: $primary-color;
      border-radius: 2rpx;
    }
  }
}

// 订单列表
.order-list {
  flex: 1;
  height: 0;
  padding: $spacing-sm;
}

.order-card {
  background-color: #fff;
  border-radius: $radius-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;
  
  .order-header {
    @include flex-between;
    margin-bottom: $spacing-base;
    padding-bottom: $spacing-sm;
    border-bottom: 1rpx solid $border-light;
    
    .shop-info {
      display: flex;
      align-items: center;
      
      .shop-icon {
        font-size: 28rpx;
        margin-right: 8rpx;
      }
      
      .shop-name {
        font-size: $font-size-base;
        font-weight: bold;
      }
    }
    
    .status {
      font-size: $font-size-sm;
      
      &.pending { color: $secondary-color; }
      &.delivering { color: $info-color; }
      &.completed { color: $success-color; }
      &.cancelled { color: $text-secondary; }
    }
  }
  
  .goods-list {
    .goods-item {
      display: flex;
      margin-bottom: $spacing-sm;
      
      .goods-img {
        width: 120rpx;
        height: 120rpx;
        border-radius: $radius-sm;
        background-color: $bg-gray;
        margin-right: $spacing-sm;
      }
      
      .goods-info {
        flex: 1;
        
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
      }
      
      .price-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        
        .price {
          font-size: $font-size-sm;
          font-weight: bold;
        }
        
        .quantity {
          font-size: $font-size-xs;
          color: $text-secondary;
          margin-top: 8rpx;
        }
      }
    }
  }
  
  .order-amount {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: $spacing-sm 0;
    border-top: 1rpx solid $border-light;
    font-size: $font-size-sm;
    color: $text-regular;
    
    .amount {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
      margin-left: 8rpx;
    }
  }
  
  .order-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: $spacing-sm;
    gap: $spacing-sm;
    
    button {
      height: 56rpx;
      line-height: 56rpx;
      padding: 0 24rpx;
      font-size: $font-size-sm;
      border-radius: 28rpx;
      margin: 0;
      
      &::after { border: none; }
    }
    
    .btn-normal {
      background-color: #fff;
      color: $text-regular;
      border: 1rpx solid $border-color;
    }
    
    .btn-primary {
      background-color: #fff;
      color: $primary-color;
      border: 1rpx solid $primary-color;
    }
  }
}

.loading-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: $text-secondary;
}
</style>