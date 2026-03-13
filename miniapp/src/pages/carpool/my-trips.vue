<template>
  <view class="my-trips-page">
    <!-- 身份切换 Tab -->
    <view class="role-tabs">
      <view
        class="tab-item"
        :class="{ active: activeRole === 'passenger' }"
        @click="switchRole('passenger')"
      >我的预约</view>
      <view
        class="tab-item"
        :class="{ active: activeRole === 'driver' }"
        @click="switchRole('driver')"
      >我发布的</view>
    </view>

    <!-- 乘客视角：我的预约 -->
    <scroll-view
      v-if="activeRole === 'passenger'"
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="bookings.length > 0">
        <view
          class="trip-card"
          v-for="booking in bookings"
          :key="booking.id"
          @click="goDetail(booking.tripId)"
        >
          <!-- 状态角标 -->
          <view class="card-header">
            <text class="trip-no">预约单号：{{ booking.bookingNo }}</text>
            <text :class="['status', `status-${booking.status}`]">{{ statusText(booking.status) }}</text>
          </view>

          <!-- 路线 -->
          <view class="route-row">
            <view class="route-place">
              <text class="dot from"></text>
              <text class="place">{{ booking.fromPlace }}</text>
            </view>
            <text class="arrow">→</text>
            <view class="route-place">
              <text class="dot to"></text>
              <text class="place">{{ booking.toPlace }}</text>
            </view>
          </view>

          <!-- 时间 & 座位 -->
          <view class="meta-row">
            <text class="meta">🕐 {{ booking.departureTime }}</text>
            <text class="meta">👤 × {{ booking.seats }}</text>
            <text class="meta price">¥{{ booking.totalPrice }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="action-row" v-if="booking.status === 'pending'">
            <button class="btn-cancel" @click.stop="cancelBooking(booking)">取消预约</button>
          </view>
        </view>
      </view>

      <Empty v-else text="暂无预约记录" image="/static/images/empty-order.png" />

      <view class="loading-more" v-if="loadingMore">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="noMore && bookings.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 司机视角：我发布的行程 -->
    <scroll-view
      v-if="activeRole === 'driver'"
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="myTrips.length > 0">
        <view
          class="trip-card"
          v-for="trip in myTrips"
          :key="trip.id"
          @click="goDetail(trip.id)"
        >
          <view class="card-header">
            <text class="trip-no">行程单号：{{ trip.tripNo }}</text>
            <text :class="['status', `status-${trip.status}`]">{{ tripStatusText(trip.status) }}</text>
          </view>

          <view class="route-row">
            <view class="route-place">
              <text class="dot from"></text>
              <text class="place">{{ trip.fromPlace }}</text>
            </view>
            <text class="arrow">→</text>
            <view class="route-place">
              <text class="dot to"></text>
              <text class="place">{{ trip.toPlace }}</text>
            </view>
          </view>

          <view class="meta-row">
            <text class="meta">🕐 {{ trip.departureTime }}</text>
            <text class="meta">💺 剩余 {{ trip.availableSeats }}/{{ trip.totalSeats }} 座</text>
            <text class="meta price">¥{{ trip.price }}/人</text>
          </view>

          <!-- 预约人数提示 -->
          <view class="booking-hint" v-if="trip.bookingCount > 0">
            <text class="hint-text">已有 {{ trip.bookingCount }} 人预约</text>
          </view>

          <!-- 操作按钮 -->
          <view class="action-row" v-if="trip.status === 'pending'">
            <button class="btn-cancel" @click.stop="cancelTrip(trip)">取消行程</button>
          </view>
        </view>
      </view>

      <Empty v-else text="暂无发布的行程" image="/static/images/empty-order.png">
        <template #action>
          <button class="btn-publish" @click="goPublish">发布行程</button>
        </template>
      </Empty>

      <view class="loading-more" v-if="loadingMore">
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="noMore && myTrips.length > 0">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <!-- 底部发布按钮（司机视角） -->
    <view class="fab safe-bottom" v-if="activeRole === 'driver'">
      <button class="btn-fab" @click="goPublish">
        <text class="fab-icon">+</text>
        <text class="fab-text">发布行程</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMyBookings, getCarpoolTrips } from '@/api/carpool'
import { useUserStore } from '@/store/modules/user'
import Empty from '@/components/common/Empty.vue'

const userStore = useUserStore()

const activeRole = ref('passenger')
const refreshing = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 10

const bookings = ref([])
const myTrips = ref([])

onShow(() => {
  loadData()
})

const loadData = async (reset = true) => {
  if (!userStore.isLoggedIn) {
    uni.redirectTo({ url: '/pages/auth/login' })
    return
  }
  if (reset) {
    page.value = 1
    noMore.value = false
    if (activeRole.value === 'passenger') {
      bookings.value = []
    } else {
      myTrips.value = []
    }
  }
  try {
    if (activeRole.value === 'passenger') {
      const res = await getMyBookings({})
      const list = Array.isArray(res) ? res : (res?.list || [])
      const mapped = list.map((item) => ({
        id: item.id,
        tripId: item.tripId || item.carpoolTripId || item.trip?.id,
        bookingNo: item.bookingNo || `BK${item.id}`,
        fromPlace: item.fromPlace || item.trip?.fromPlace || item.trip?.startPlace || '未知出发地',
        toPlace: item.toPlace || item.trip?.toPlace || item.trip?.endPlace || '未知目的地',
        departureTime: item.departureTime || item.trip?.departureTime || '',
        seats: item.seats || item.passengerCount || 1,
        totalPrice: item.totalPrice || item.amount || 0,
        status: normalizeStatus(item.status)
      }))
      bookings.value = reset ? mapped : [...bookings.value, ...mapped]
      noMore.value = mapped.length < pageSize
    } else {
      const res = await getCarpoolTrips({
        skip: (page.value - 1) * pageSize,
        take: pageSize
      })
      const list = Array.isArray(res) ? res : (res?.list || [])
      const mapped = list.map((item) => ({
        id: item.id,
        tripNo: item.tripNo || `TR${item.id}`,
        fromPlace: item.fromPlace || item.startPlace || '未知出发地',
        toPlace: item.toPlace || item.endPlace || item.village || '未知目的地',
        departureTime: item.departureTime || '',
        totalSeats: item.totalSeats || item.seats || 0,
        availableSeats: item.availableSeats ?? item.remainSeats ?? 0,
        price: item.price || 0,
        bookingCount: item.bookingCount || 0,
        status: normalizeStatus(item.status)
      }))
      myTrips.value = reset ? mapped : [...myTrips.value, ...mapped]
      noMore.value = mapped.length < pageSize
    }
  } catch (error) {
    console.error('加载行程列表失败', error)
  }
}

const switchRole = (role) => {
  activeRole.value = role
  loadData()
}

const loadMore = async () => {
  if (loadingMore.value || noMore.value) return
  loadingMore.value = true
  page.value++
  await loadData(false)
  loadingMore.value = false
}

const onRefresh = async () => {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

const normalizeStatus = (status) => {
  if (typeof status === 'number') {
    if (status === 0) return 'pending'
    if (status === 1) return 'ongoing'
    if (status === 2) return 'completed'
    if (status === 3) return 'cancelled'
  }
  return status || 'pending'
}

const statusText = (status) => {
  const map = {
    pending: '待出发',
    ongoing: '行程中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

const tripStatusText = (status) => {
  const map = {
    pending: '待出发',
    ongoing: '行程中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

const goDetail = (tripId) => {
  uni.navigateTo({ url: `/pages/carpool/detail?id=${tripId}` })
}

const goPublish = () => {
  uni.navigateTo({ url: '/pages/carpool/publish' })
}

const cancelBooking = () => {
  uni.showToast({
    title: '后端暂未提供取消预约接口',
    icon: 'none'
  })
}

const cancelTrip = () => {
  uni.showToast({
    title: '后端暂未提供取消行程接口',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.my-trips-page {
  min-height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

// 角色切换 Tab
.role-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid $border-color;

  .tab-item {
    flex: 1;
    height: 88rpx;
    @include flex-center;
    font-size: $font-size-base;
    color: $text-secondary;
    position: relative;

    &.active {
      color: $primary-color;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: $primary-color;
        border-radius: 2rpx;
      }
    }
  }
}

.list-scroll {
  flex: 1;
  height: calc(100vh - 88rpx);
  padding: $spacing-sm;

  .trip-card {
    @include card;
    margin-bottom: $spacing-sm;

    .card-header {
      @include flex-between;
      margin-bottom: $spacing-sm;

      .trip-no {
        font-size: $font-size-xs;
        color: $text-secondary;
      }

      .status {
        font-size: $font-size-xs;
        padding: 4rpx 16rpx;
        border-radius: $radius-round;

        &-pending {
          color: $primary-color;
          background-color: rgba($primary-color, 0.1);
        }

        &-ongoing {
          color: $secondary-color;
          background-color: rgba($secondary-color, 0.1);
        }

        &-completed {
          color: $text-secondary;
          background-color: $bg-gray;
        }

        &-cancelled {
          color: $text-placeholder;
          background-color: $bg-gray;
        }
      }
    }

    .route-row {
      display: flex;
      align-items: center;
      margin-bottom: $spacing-sm;

      .route-place {
        display: flex;
        align-items: center;

        .dot {
          width: 14rpx;
          height: 14rpx;
          border-radius: 50%;
          margin-right: 8rpx;
          flex-shrink: 0;

          &.from { background-color: $primary-color; }
          &.to { background-color: $secondary-color; }
        }

        .place {
          font-size: $font-size-md;
          font-weight: bold;
          max-width: 180rpx;
          @include ellipsis(1);
        }
      }

      .arrow {
        margin: 0 $spacing-sm;
        color: $text-placeholder;
        font-size: $font-size-sm;
      }
    }

    .meta-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: $spacing-sm;

      .meta {
        font-size: $font-size-xs;
        color: $text-regular;

        &.price {
          font-weight: bold;
          color: $price-color;
          font-size: $font-size-sm;
          margin-left: auto;
        }
      }
    }

    .booking-hint {
      margin-top: $spacing-sm;
      padding: 8rpx 16rpx;
      background-color: rgba($primary-color, 0.08);
      border-radius: $radius-sm;

      .hint-text {
        font-size: $font-size-xs;
        color: $primary-color;
      }
    }

    .action-row {
      margin-top: $spacing-sm;
      display: flex;
      justify-content: flex-end;

      .btn-cancel {
        margin: 0;
        padding: 0 $spacing-base;
        height: 56rpx;
        line-height: 56rpx;
        font-size: $font-size-sm;
        background-color: transparent;
        color: $text-secondary;
        border: 1rpx solid $border-color;
        border-radius: $radius-round;

        &::after { border: none; }
      }
    }
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: $spacing-base;

  text {
    font-size: $font-size-xs;
    color: $text-placeholder;
  }
}

// 底部发布按钮
.fab {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-sm $spacing-base;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .btn-fab {
    @include btn-primary;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after { border: none; }

    .fab-icon {
      font-size: 36rpx;
      margin-right: 8rpx;
      font-weight: bold;
    }

    .fab-text {
      font-size: $font-size-base;
    }
  }
}

// Empty 组件内的发布按钮
.btn-publish {
  margin-top: $spacing-base;
  padding: 0 $spacing-xl;
  height: 72rpx;
  line-height: 72rpx;
  background-color: $primary-color;
  color: #fff;
  border-radius: 36rpx;
  font-size: $font-size-base;

  &::after { border: none; }
}
</style>