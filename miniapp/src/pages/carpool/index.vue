<template>
  <view class="carpool-page">
    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="route-picker">
        <view class="route-item" @click="pickLocation('from')">
          <text class="dot from"></text>
          <text class="text" :class="{ placeholder: !fromPlace }">{{ fromPlace || '出发地' }}</text>
        </view>
        <view class="swap-btn" @click="swapRoute">⇅</view>
        <view class="route-item" @click="pickLocation('to')">
          <text class="dot to"></text>
          <text class="text" :class="{ placeholder: !toPlace }">{{ toPlace || '目的地' }}</text>
        </view>
      </view>
      
      <view class="date-picker" @click="showDatePicker = true">
        <text class="icon">📅</text>
        <text class="date">{{ displayDate }}</text>
        <text class="arrow">›</text>
      </view>
      
      <button class="btn-search" @click="handleSearch">搜索行程</button>
    </view>
    
    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="action-item" @click="goPublish">
        <text class="icon">🚗</text>
        <text class="title">发布行程</text>
        <text class="desc">顺路捎带赚油费</text>
      </view>
      <view class="action-item" @click="goMyTrips">
        <text class="icon">📋</text>
        <text class="title">我的行程</text>
        <text class="desc">查看发布/预约</text>
      </view>
    </view>
    
    <!-- 推荐行程 -->
    <view class="recommend-section">
      <view class="section-header">
        <text class="title">附近行程</text>
      </view>
      
      <scroll-view class="trip-list" scroll-y @scrolltolower="loadMore">
        <view class="trip-card" v-for="trip in tripList" :key="trip.id">
          <view class="trip-route">
            <view class="from">
              <text class="dot"></text>
              <text class="name">{{ trip.fromPlace }}</text>
            </view>
            <view class="line-arrow">→</view>
            <view class="to">
              <text class="dot"></text>
              <text class="name">{{ trip.toPlace }}</text>
            </view>
          </view>
          
          <view class="trip-info">
            <view class="info-row">
              <text class="time">🕐 {{ trip.departureTime }}</text>
              <text class="seats">🪑 剩余{{ trip.availableSeats }}座</text>
            </view>
            <view class="info-row">
              <view class="driver-info">
                <image class="driver-avatar" :src="trip.driverAvatar || '/static/images/default-avatar.png'" mode="aspectFill" />
                <text class="driver-name">{{ trip.driverName }}</text>
                <text class="rating">⭐{{ trip.rating || '5.0' }}</text>
              </view>
              <text class="price">¥{{ trip.price }}/人</text>
            </view>
          </view>
        </view>
        
        <view v-if="loading" class="loading-more"><text>加载中...</text></view>
        <view v-if="!loading && noMore && tripList.length > 0" class="no-more"><text>没有更多了</text></view>
        <Empty v-if="!loading && tripList.length === 0" text="附近暂无行程" />
      </scroll-view>
    </view>
    
    <!-- 日期选择器 -->
    <picker 
      v-if="showDatePicker"
      mode="date" 
      :start="todayStr" 
      :end="maxDateStr"
      :value="selectedDate"
      @change="onDateChange" 
      @cancel="showDatePicker = false"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCarpoolTrips } from '@/api/carpool'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const fromPlace = ref('')
const toPlace = ref('')
const selectedDate = ref('')
const showDatePicker = ref(false)
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const tripList = ref([])

const today = new Date()
const todayStr = formatDateStr(today)
const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
const maxDateStr = formatDateStr(maxDate)

function formatDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const displayDate = computed(() => {
  if (!selectedDate.value) return '选择日期'
  const d = new Date(selectedDate.value)
  const isToday = selectedDate.value === todayStr
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${isToday ? '今天' : weekDays[d.getDay()]}`
})

onLoad(() => {
  selectedDate.value = todayStr
  fetchTrips()
})

const fetchTrips = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  
  try {
    const res = await getCarpoolTrips({
      village: toPlace.value || fromPlace.value || undefined,
      departureTime: selectedDate.value ? `${selectedDate.value}T00:00:00.000Z` : undefined,
      skip: (page.value - 1) * 10,
      take: 10
    })

    const rawList = Array.isArray(res) ? res : (res?.list || [])
    const list = rawList.map((item) => ({
      id: item.id,
      fromPlace: item.fromPlace || item.startPlace || item.from || '未知出发地',
      toPlace: item.toPlace || item.endPlace || item.village || '未知目的地',
      departureTime: item.departureTime || item.departAt || '',
      availableSeats: item.availableSeats ?? item.remainSeats ?? item.seats ?? 0,
      price: item.price ?? 0,
      driverName: item.driverName || item.publisherName || '车主',
      driverAvatar: item.driverAvatar || '',
      rating: item.rating || '5.0'
    }))
    tripList.value = [...tripList.value, ...list]
    
    if (list.length < 10) {
      noMore.value = true
    }
    page.value++
  } catch (error) {
    console.error('获取行程失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!noMore.value && !loading.value) {
    fetchTrips()
  }
}

const handleSearch = () => {
  page.value = 1
  noMore.value = false
  tripList.value = []
  fetchTrips()
}

const swapRoute = () => {
  const temp = fromPlace.value
  fromPlace.value = toPlace.value
  toPlace.value = temp
}

const pickLocation = (type) => {
  // 实际项目中可以跳转地图选点页面或使用地点搜索
  uni.showActionSheet({
    itemList: ['某某村', '县城', '乡镇集市', '市区', '火车站'],
    success: (res) => {
      const place = ['某某村', '县城', '乡镇集市', '市区', '火车站'][res.tapIndex]
      if (type === 'from') {
        fromPlace.value = place
      } else {
        toPlace.value = place
      }
    }
  })
}

const onDateChange = (e) => {
  selectedDate.value = e.detail.value
  showDatePicker.value = false
}

const goPublish = () => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  uni.navigateTo({ url: '/pages/carpool/publish' })
}

const goMyTrips = () => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  uni.navigateTo({ url: '/pages/carpool/my-trips' })
}

</script>

<style lang="scss" scoped>
.carpool-page {
  min-height: 100vh;
  background-color: $bg-color;
}

// 搜索区域
.search-section {
  background-color: #fff;
  margin: $spacing-sm;
  border-radius: $radius-base;
  padding: $spacing-base;
  box-shadow: $shadow-base;
  
  .route-picker {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-base;
    
    .route-item {
      flex: 1;
      display: flex;
      align-items: center;
      padding: $spacing-sm;
      background-color: $bg-gray;
      border-radius: $radius-sm;
      
      .dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-right: 12rpx;
        
        &.from { background-color: $primary-color; }
        &.to { background-color: $secondary-color; }
      }
      
      .text {
        font-size: $font-size-base;
        color: $text-primary;
        
        &.placeholder { color: $text-placeholder; }
      }
    }
    
    .swap-btn {
      width: 56rpx;
      height: 56rpx;
      @include flex-center;
      font-size: 36rpx;
      color: $primary-color;
      margin: 0 $spacing-sm;
    }
  }
  
  .date-picker {
    @include flex-between;
    padding: $spacing-sm;
    background-color: $bg-gray;
    border-radius: $radius-sm;
    margin-bottom: $spacing-base;
    
    .icon { font-size: 32rpx; margin-right: 12rpx; }
    .date { flex: 1; font-size: $font-size-base; color: $text-primary; }
    .arrow { color: $text-secondary; }
  }
  
  .btn-search {
    @include btn-primary;
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    font-size: $font-size-lg;
    
    &::after { border: none; }
  }
}

// 快捷功能
.quick-actions {
  display: flex;
  padding: $spacing-sm $spacing-base;
  gap: $spacing-sm;
  
  .action-item {
    flex: 1;
    background-color: #fff;
    border-radius: $radius-base;
    padding: $spacing-base;
    display: flex;
    flex-direction: column;
    
    .icon { font-size: 48rpx; margin-bottom: 12rpx; }
    .title {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    .desc {
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
}

// 行程列表
.recommend-section {
  .section-header {
    padding: $spacing-base $spacing-base 0;
    
    .title {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
    }
  }
  
  .trip-list {
    padding: $spacing-sm $spacing-base;
  }
}

.trip-card {
  background-color: #fff;
  border-radius: $radius-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;
  
  .trip-route {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-base;
    
    .from, .to {
      display: flex;
      align-items: center;
      
      .dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        margin-right: 8rpx;
      }
      
      .name {
        font-size: $font-size-md;
        font-weight: bold;
      }
    }
    
    .from .dot { background-color: $primary-color; }
    .to .dot { background-color: $secondary-color; }
    
    .line-arrow {
      flex: 1;
      text-align: center;
      font-size: 32rpx;
      color: $text-placeholder;
    }
  }
  
  .trip-info {
    .info-row {
      @include flex-between;
      margin-bottom: $spacing-sm;
      
      &:last-child { margin-bottom: 0; }
      
      .time, .seats {
        font-size: $font-size-sm;
        color: $text-regular;
      }
      
      .driver-info {
        display: flex;
        align-items: center;
        
        .driver-avatar {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          margin-right: 8rpx;
          background-color: $bg-gray;
        }
        
        .driver-name {
          font-size: $font-size-sm;
          color: $text-primary;
          margin-right: 12rpx;
        }
        
        .rating {
          font-size: $font-size-xs;
          color: $secondary-color;
        }
      }
      
      .price {
        font-size: $font-size-lg;
        font-weight: bold;
        color: $price-color;
      }
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