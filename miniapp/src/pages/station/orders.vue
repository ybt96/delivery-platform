<template>
  <view class="station-orders-page">
    <!-- 状态筛选 tabs -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 加载中 -->
      <view v-if="stationStore.purchaseOrderLoading && displayList.length === 0" class="loading-wrap">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!stationStore.purchaseOrderLoading && displayList.length === 0" class="empty-wrap">
        <Empty text="暂无代购订单" />
        <view class="empty-action" @tap="goPurchase">去提交代购申请</view>
      </view>

      <!-- 订单列表 -->
      <view v-else class="order-list">
        <view
          v-for="order in displayList"
          :key="order.id"
          class="order-card"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <text class="order-no">订单 #{{ order.id }}</text>
            <text class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </text>
          </view>

          <!-- 商品信息 -->
          <view class="card-body">
            <view class="product-row">
              <text class="product-name">{{ order.productName }}</text>
              <text class="product-qty">× {{ order.quantity }}</text>
            </view>
            <view v-if="order.remark" class="product-remark">
              备注：{{ order.remark }}
            </view>
          </view>

          <!-- 时间信息 -->
          <view class="card-meta">
            <text class="meta-date">提交于 {{ formatDate(order.createdAt) }}</text>
            <text v-if="order.budget" class="meta-budget">预算 ¥{{ order.budget }}</text>
          </view>

          <!-- 收货信息 -->
          <view class="card-delivery">
            <text class="delivery-text">
              收货人：{{ order.contactName }} {{ maskPhone(order.contactPhone) }}
            </text>
          </view>

          <!-- 操作按钮 -->
          <view class="card-actions">
            <view
              v-if="canCancel(order.status)"
              class="action-btn cancel-btn"
              @tap="cancelOrder(order)"
            >
              取消申请
            </view>
            <view class="action-btn contact-btn" @tap="contactStation(order)">
              联系站长
            </view>
          </view>
        </view>
      </view>

      <!-- 底部状态 -->
      <view v-if="displayList.length > 0" class="list-footer">
        <text v-if="stationStore.purchaseOrderHasMore" class="footer-text loading-text">加载更多...</text>
        <text v-else class="footer-text">已显示全部订单</text>
      </view>
    </scroll-view>

    <!-- FAB 提交新代购 -->
    <view class="fab-btn" @tap="goPurchase">
      <text class="fab-icon">＋</text>
      <text class="fab-text">新代购</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStationStore } from '@/store/modules/station'

const stationStore = useStationStore()
const refreshing = ref(false)
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '采购中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]

const displayList = computed(() => {
  const list = stationStore.purchaseOrders
  if (activeTab.value === 'all') return list
  return list.filter(o => normalizeStatus(o.status) === activeTab.value)
})

onMounted(() => {
  stationStore.loadPurchaseOrders(true)
})

function normalizeStatus(status) {
  const map = {
    0: 'pending',
    1: 'processing',
    2: 'completed',
    3: 'cancelled',
    pending: 'pending',
    processing: 'processing',
    completed: 'completed',
    cancelled: 'cancelled'
  }
  return map[status] || 'pending'
}

function getStatusText(status) {
  const map = {
    pending: '待处理',
    processing: '采购中',
    completed: '已完成',
    cancelled: '已取消',
    0: '待处理',
    1: '采购中',
    2: '已完成',
    3: '已取消'
  }
  return map[status] || '待处理'
}

function getStatusClass(status) {
  const s = normalizeStatus(status)
  return {
    'status-pending': s === 'pending',
    'status-processing': s === 'processing',
    'status-completed': s === 'completed',
    'status-cancelled': s === 'cancelled'
  }
}

function canCancel(status) {
  const s = normalizeStatus(status)
  return s === 'pending'
}

function switchTab(key) {
  activeTab.value = key
}

async function onRefresh() {
  refreshing.value = true
  await stationStore.loadPurchaseOrders(true)
  refreshing.value = false
}

async function loadMore() {
  if (!stationStore.purchaseOrderHasMore || stationStore.purchaseOrderLoading) return
  await stationStore.loadPurchaseOrders(false)
}

async function cancelOrder(order) {
  uni.showModal({
    title: '取消代购',
    content: '确定要取消这笔代购申请吗？',
    success: async (res) => {
      if (res.confirm) {
        // 后端暂无取消接口，仅提示
        uni.showToast({ title: '请联系站长协商取消', icon: 'none', duration: 2500 })
      }
    }
  })
}

function contactStation(order) {
  uni.showToast({ title: '请拨打站长电话', icon: 'none' })
}

function goPurchase() {
  uni.navigateTo({ url: '/pages/station/purchase' })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}
</script>

<style lang="scss" scoped>
.station-orders-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  background: #ffffff;
  display: flex;
  padding: 0 10rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 26rpx;
    color: #999;
    position: relative;

    &.active {
      color: #4CAF50;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #4CAF50;
        border-radius: 2rpx;
      }
    }
  }
}

.list-scroll {
  flex: 1;
  padding-bottom: 160rpx;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 120rpx 0;

  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

.empty-action {
  margin-top: 24rpx;
  padding: 16rpx 48rpx;
  background: #4CAF50;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.order-list {
  padding: 20rpx;
}

.order-card {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .order-no {
      font-size: 24rpx;
      color: #999;
    }

    .order-status {
      font-size: 26rpx;
      font-weight: 600;

      &.status-pending { color: #FF9800; }
      &.status-processing { color: #2196F3; }
      &.status-completed { color: #4CAF50; }
      &.status-cancelled { color: #9e9e9e; }
    }
  }

  .card-body {
    padding: 20rpx 24rpx;

    .product-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8rpx;

      .product-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        flex: 1;
      }

      .product-qty {
        font-size: 26rpx;
        color: #999;
        margin-left: 16rpx;
      }
    }

    .product-remark {
      font-size: 24rpx;
      color: #bbb;
      line-height: 1.5;
    }
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24rpx 16rpx;

    .meta-date {
      font-size: 22rpx;
      color: #ccc;
    }

    .meta-budget {
      font-size: 24rpx;
      color: #FF9800;
    }
  }

  .card-delivery {
    padding: 12rpx 24rpx;
    background: #f9f9f9;

    .delivery-text {
      font-size: 24rpx;
      color: #666;
    }
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
    padding: 16rpx 24rpx;

    .action-btn {
      height: 64rpx;
      padding: 0 32rpx;
      border-radius: 32rpx;
      font-size: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.cancel-btn {
        border: 2rpx solid #e0e0e0;
        color: #999;
      }

      &.contact-btn {
        border: 2rpx solid #4CAF50;
        color: #4CAF50;
      }
    }
  }
}

.list-footer {
  text-align: center;
  padding: 24rpx 0;

  .footer-text {
    font-size: 24rpx;
    color: #ccc;
  }
}

.fab-btn {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  background: #4CAF50;
  border-radius: 56rpx;
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(76, 175, 80, 0.4);

  .fab-icon {
    font-size: 32rpx;
    color: #ffffff;
    margin-right: 8rpx;
    font-weight: 300;
  }

  .fab-text {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 500;
  }
}
</style>