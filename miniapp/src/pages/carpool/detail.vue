<template>
  <view class="carpool-detail-page">
    <!-- 行程路线 -->
    <view class="route-card">
      <view class="route-main">
        <view class="route-from">
          <text class="dot from"></text>
          <text class="place">{{ trip.fromPlace }}</text>
        </view>
        <view class="route-mid">
          <text class="distance">约{{ trip.distance }}公里</text>
          <view class="dashed-line"></view>
          <text class="duration">{{ trip.duration }}</text>
        </view>
        <view class="route-to">
          <text class="dot to"></text>
          <text class="place">{{ trip.toPlace }}</text>
        </view>
      </view>
      
      <view class="time-info">
        <text class="departure-time">{{ trip.departureTime }}</text>
        <text class="seats-info">共{{ trip.totalSeats }}座 · 剩余{{ trip.availableSeats }}座</text>
      </view>
    </view>
    
    <!-- 司机信息 -->
    <view class="section driver-section">
      <view class="driver-info">
        <image class="avatar" :src="trip.driverAvatar || '/static/images/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <view class="name-row">
            <text class="name">{{ trip.driverName }}</text>
            <text class="tag-certified" v-if="trip.isCertified">已实名</text>
          </view>
          <view class="stats-row">
            <text class="stat">⭐ {{ trip.rating || '5.0' }}分</text>
            <text class="stat">🚗 {{ trip.tripCount || 0 }}次出行</text>
          </view>
        </view>
        <button class="btn-contact" open-type="contact" @click="contactDriver">联系司机</button>
      </view>
      
      <view class="car-info" v-if="trip.carInfo">
        <text class="icon">🚘</text>
        <text class="car">{{ trip.carInfo }}</text>
      </view>
    </view>
    
    <!-- 行程说明 -->
    <view class="section description-section" v-if="trip.description">
      <text class="title">行程说明</text>
      <text class="content">{{ trip.description }}</text>
    </view>
    
    <!-- 预约须知 -->
    <view class="section notice-section">
      <text class="title">预约须知</text>
      <view class="notice-list">
        <text class="notice-item">📌 请准时在出发地等候，司机有权取消逾时乘客</text>
        <text class="notice-item">📌 顺风车为非盈利性合乘，请文明乘车</text>
        <text class="notice-item">📌 出行前请如实填写行程信息</text>
        <text class="notice-item">📌 费用为分摊燃油费，不包含其他服务</text>
      </view>
    </view>
    
    <!-- 底部预约栏 -->
    <view class="bottom-bar safe-bottom" v-if="trip.availableSeats > 0">
      <view class="price-info">
        <text class="price">¥{{ trip.price }}</text>
        <text class="per">/人</text>
      </view>
      <view class="seat-select">
        <text class="label">预约座位：</text>
        <view class="btn-minus" @click="bookSeats > 1 && bookSeats--">-</view>
        <text class="num">{{ bookSeats }}</text>
        <view class="btn-plus" @click="bookSeats < trip.availableSeats && bookSeats++">+</view>
      </view>
      <button class="btn-book" @click="handleBook">立即预约</button>
    </view>
    
    <view class="bottom-bar safe-bottom sold-out" v-else>
      <text class="sold-text">座位已满，无法预约</text>
    </view>
    
    <!-- 预约成功弹窗 -->
    <view class="modal-mask" v-if="showBookModal">
      <view class="modal-content">
        <text class="modal-icon">✅</text>
        <text class="modal-title">预约成功</text>
        <text class="modal-desc">请于 {{ trip.departureTime }} 在 {{ trip.fromPlace }} 等候</text>
        <text class="modal-contact">司机将通过平台消息通知您</text>
        <view class="modal-actions">
          <button class="btn-primary" @click="showBookModal = false">我知道了</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCarpoolTripDetail, bookTrip } from '@/api/carpool'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const trip = ref({
  id: '',
  fromPlace: '',
  toPlace: '',
  distance: '',
  duration: '',
  departureTime: '',
  totalSeats: 0,
  availableSeats: 0,
  price: 0,
  driverName: '',
  driverAvatar: '',
  driverPhone: '',
  isCertified: false,
  rating: '5.0',
  tripCount: 0,
  carInfo: '',
  description: ''
})

const bookSeats = ref(1)
const showBookModal = ref(false)

onLoad(async (options) => {
  if (options.id) {
    await fetchDetail(options.id)
  }
})

const fetchDetail = async (id) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getCarpoolTripDetail(id)
    trip.value = res
  } catch (error) {
    console.error('获取行程详情失败', error)
    // 使用模拟数据
    trip.value = {
      id,
      fromPlace: '某某村',
      toPlace: '县城',
      distance: '25',
      duration: '约40分钟',
      departureTime: '明天 08:30',
      totalSeats: 4,
      availableSeats: 2,
      price: 15,
      driverName: '老李',
      driverAvatar: '',
      isCertified: true,
      rating: '4.8',
      tripCount: 35,
      carInfo: '白色 大众朗逸 · 浙XX1234',
      description: '途经乡镇集市，可在集市停留10分钟，需要带东西的乘客可以捎带。'
    }
  } finally {
    uni.hideLoading()
  }
}

const contactDriver = () => {
  uni.showToast({ title: '请通过平台消息联系', icon: 'none' })
}

const handleBook = async () => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  
  if (!userStore.userInfo.isCertified) {
    return uni.showModal({
      title: '提示',
      content: '预约顺风车需要先完成实名认证',
      confirmText: '去认证',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/user/profile' })
        }
      }
    })
  }
  
  try {
    uni.showLoading({ title: '预约中...' })
    // await bookTrip(trip.value.id, { seats: bookSeats.value })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    uni.hideLoading()
    showBookModal.value = true
    
    // 更新剩余座位数（本地更新）
    trip.value.availableSeats -= bookSeats.value
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '预约失败，请稍后重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.carpool-detail-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 120rpx;
}

.route-card {
  @include card;
  
  .route-main {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-base;
    
    .route-from, .route-to {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-bottom: 8rpx;
        
        &.from { background-color: $primary-color; }
        &.to { background-color: $secondary-color; }
      }
      
      .place {
        font-size: $font-size-xl;
        font-weight: bold;
        max-width: 180rpx;
        text-align: center;
        @include ellipsis(1);
      }
    }
    
    .route-mid {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 $spacing-sm;
      
      .distance, .duration {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
      
      .dashed-line {
        width: 80%;
        height: 2rpx;
        border-top: 2rpx dashed $border-color;
        margin: 8rpx 0;
      }
    }
  }
  
  .time-info {
    @include flex-between;
    
    .departure-time {
      font-size: $font-size-md;
      color: $primary-color;
      font-weight: bold;
    }
    
    .seats-info {
      font-size: $font-size-sm;
      color: $text-regular;
    }
  }
}

.section {
  @include card;
}

.driver-section {
  .driver-info {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-sm;
    
    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background-color: $bg-gray;
      margin-right: $spacing-base;
    }
    
    .info {
      flex: 1;
      
      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .name {
          font-size: $font-size-lg;
          font-weight: bold;
          margin-right: $spacing-sm;
        }
        
        .tag-certified {
          @include tag($success-color);
        }
      }
      
      .stats-row {
        display: flex;
        
        .stat {
          font-size: $font-size-xs;
          color: $text-secondary;
          margin-right: $spacing-sm;
        }
      }
    }
    
    .btn-contact {
      margin: 0;
      padding: 0 24rpx;
      height: 60rpx;
      line-height: 60rpx;
      font-size: $font-size-sm;
      background-color: transparent;
      color: $primary-color;
      border: 1rpx solid $primary-color;
      border-radius: $radius-round;
      
      &::after { border: none; }
    }
  }
  
  .car-info {
    display: flex;
    align-items: center;
    padding: $spacing-sm;
    background-color: $bg-gray;
    border-radius: $radius-sm;
    
    .icon { font-size: 32rpx; margin-right: 12rpx; }
    .car { font-size: $font-size-sm; color: $text-regular; }
  }
}

.description-section {
  .title, .notice-section .title {
    font-size: $font-size-md;
    font-weight: bold;
    display: block;
    margin-bottom: $spacing-sm;
  }
  
  .content {
    font-size: $font-size-sm;
    color: $text-regular;
    line-height: 1.6;
  }
}

.notice-section {
  .notice-list {
    .notice-item {
      font-size: $font-size-xs;
      color: $text-secondary;
      display: block;
      line-height: 1.8;
    }
  }
}

// 底部预约栏
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
  
  &.sold-out {
    @include flex-center;
    
    .sold-text {
      font-size: $font-size-base;
      color: $text-secondary;
    }
  }
  
  .price-info {
    display: flex;
    align-items: baseline;
    margin-right: $spacing-base;
    
    .price {
      font-size: 44rpx;
      font-weight: bold;
      color: $price-color;
    }
    
    .per {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
  
  .seat-select {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .label {
      font-size: $font-size-sm;
      color: $text-regular;
    }
    
    .btn-minus, .btn-plus {
      width: 48rpx;
      height: 48rpx;
      @include flex-center;
      border: 1rpx solid $border-color;
      border-radius: $radius-sm;
      font-size: 28rpx;
    }
    
    .num {
      width: 60rpx;
      text-align: center;
      font-size: $font-size-md;
      font-weight: bold;
    }
  }
  
  .btn-book {
    width: 200rpx;
    height: 72rpx;
    line-height: 72rpx;
    background-color: $primary-color;
    color: #fff;
    border-radius: 36rpx;
    font-size: $font-size-base;
    margin: 0;
    
    &::after { border: none; }
  }
}

// 预约成功弹窗
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  @include flex-center;
  z-index: 999;
  
  .modal-content {
    width: 640rpx;
    background-color: #fff;
    border-radius: $radius-md;
    padding: $spacing-xl $spacing-lg;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .modal-icon {
      font-size: 96rpx;
      margin-bottom: $spacing-base;
    }
    
    .modal-title {
      font-size: $font-size-xl;
      font-weight: bold;
      margin-bottom: $spacing-sm;
    }
    
    .modal-desc {
      font-size: $font-size-base;
      color: $text-regular;
      text-align: center;
      line-height: 1.5;
      margin-bottom: $spacing-sm;
    }
    
    .modal-contact {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-bottom: $spacing-lg;
    }
    
    .modal-actions {
      width: 100%;
      
      .btn-primary {
        @include btn-primary;
        width: 100%;
        
        &::after { border: none; }
      }
    }
  }
}
</style>