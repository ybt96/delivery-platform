<template>
  <view class="coupons-page">
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'available' }"
        @click="switchTab('available')"
      >
        <text>领券中心</text>
        <view class="indicator" v-if="currentTab === 'available'"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'mine' }"
        @click="switchTab('mine')"
      >
        <text>我的优惠券</text>
        <view class="indicator" v-if="currentTab === 'mine'"></view>
      </view>
    </view>
    
    <scroll-view class="coupon-list" scroll-y @scrolltolower="loadMore">
      <view 
        class="coupon-card" 
        v-for="item in couponList" 
        :key="item.id"
        :class="{ disabled: item.status !== 'available' && item.status !== 'unused' }"
      >
        <view class="coupon-left">
          <view class="amount-wrap">
            <text class="symbol">¥</text>
            <text class="amount">{{ item.amount }}</text>
          </view>
          <text class="condition">满{{ item.minConsume }}可用</text>
        </view>
        
        <view class="coupon-mid">
          <text class="title">{{ item.name }}</text>
          <text class="shop" v-if="item.shopName">{{ item.shopName }}</text>
          <text class="time">有效期至：{{ item.expireTime }}</text>
        </view>
        
        <view class="coupon-right">
          <!-- 领券中心 -->
          <template v-if="currentTab === 'available'">
            <button class="btn-action claim" @click="handleClaim(item)">领取</button>
          </template>
          
          <!-- 我的优惠券 -->
          <template v-else>
            <button class="btn-action use" v-if="item.status === 'unused'" @click="goUse(item)">去使用</button>
            <image class="status-stamp" v-else-if="item.status === 'used'" src="/static/images/stamp-used.png" mode="aspectFit" />
            <image class="status-stamp" v-else-if="item.status === 'expired'" src="/static/images/stamp-expired.png" mode="aspectFit" />
          </template>
        </view>
      </view>
      
      <view v-if="loading" class="loading-more"><text>加载中...</text></view>
      <view v-if="!loading && noMore && couponList.length > 0" class="no-more"><text>没有更多了</text></view>
      <Empty v-if="!loading && couponList.length === 0" :text="currentTab === 'available' ? '暂无可领优惠券' : '暂无优惠券'" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCoupons, claimCoupon, getMyCoupons } from '@/api/alliance'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const currentTab = ref('available')
const couponList = ref([])
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 10

onLoad(() => {
  fetchCoupons()
})

const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  
  if (tab === 'mine' && !userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    currentTab.value = 'available' // 恢复状态
    return
  }
  
  page.value = 1
  noMore.value = false
  couponList.value = []
  fetchCoupons()
}

const fetchCoupons = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  
  try {
    let res
    if (currentTab.value === 'available') {
      if (currentTab.value === 'available') {
        res = await getCoupons({
          skip: (page.value - 1) * pageSize,
          take: pageSize
        })
      } else {
        res = await getMyCoupons({
          status: 0
        })
      }
    }

    const rawList = Array.isArray(res) ? res : (res?.list || [])
    const list = rawList.map((item) => ({
      id: item.id,
      name: item.name || item.title || '优惠券',
      amount: item.amount ?? item.discountAmount ?? 0,
      minConsume: item.minConsume ?? item.minAmount ?? 0,
      shopName: item.shopName || item.merchantName || '',
      expireTime: item.expireTime || item.expireAt || item.validUntil || '',
      status: normalizeCouponStatus(item.status, currentTab.value)
    }))

    couponList.value = [...couponList.value, ...list]
    
    if (list.length < pageSize) {
      noMore.value = true
    }
    page.value++
  } catch (error) {
    console.error('获取优惠券失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!noMore.value && !loading.value) {
    fetchCoupons()
  }
}

const handleClaim = async (coupon) => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  
  try {
    await claimCoupon(coupon.id)
    uni.showToast({ title: '领取成功', icon: 'success' })
    page.value = 1
    noMore.value = false
    couponList.value = []
    fetchCoupons()
  } catch (error) {
    uni.showToast({ title: '领取失败', icon: 'none' })
  }
}

const normalizeCouponStatus = (status, tab) => {
  if (typeof status === 'number') {
    if (tab === 'available') return 'available'
    if (status === 0) return 'unused'
    if (status === 1) return 'used'
    if (status === 2) return 'expired'
  }
  return status || (tab === 'available' ? 'available' : 'unused')
}

const goUse = (coupon) => {
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
.coupons-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
}

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
      bottom: 0;
      width: 60rpx;
      height: 6rpx;
      background-color: $primary-color;
      border-radius: 3rpx;
    }
  }
}

.coupon-list {
  flex: 1;
  height: 0;
  padding: $spacing-sm $spacing-base;
}

.coupon-card {
  display: flex;
  background-color: #fff;
  border-radius: $radius-base;
  margin-bottom: $spacing-sm;
  position: relative;
  overflow: hidden;
  box-shadow: $shadow-sm;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 30rpx;
    height: 30rpx;
    background-color: $bg-color;
    border-radius: 50%;
    transform: translateY(-50%);
  }
  
  &::before { left: -15rpx; }
  &::after { right: -15rpx; }
  
  &.disabled {
    opacity: 0.6;
    
    .coupon-left {
      background: linear-gradient(135deg, #ccc, #aaa);
    }
    
    .btn-action {
      background-color: #ccc;
      color: #fff;
    }
  }
  
  .coupon-left {
    width: 200rpx;
    background: linear-gradient(135deg, $primary-light, $primary-color);
    color: #fff;
    @include flex-center;
    flex-direction: column;
    padding: $spacing-sm;
    
    .amount-wrap {
      display: flex;
      align-items: baseline;
      
      .symbol { font-size: $font-size-sm; }
      .amount { font-size: 64rpx; font-weight: bold; }
    }
    
    .condition {
      font-size: $font-size-xs;
      margin-top: 8rpx;
    }
  }
  
  .coupon-mid {
    flex: 1;
    padding: $spacing-base;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-right: 2rpx dashed $border-color;
    
    .title {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    
    .shop {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-bottom: 8rpx;
      @include ellipsis(1);
    }
    
    .time {
      font-size: 20rpx;
      color: $text-placeholder;
    }
  }
  
  .coupon-right {
    width: 140rpx;
    @include flex-center;
    
    .btn-action {
      width: 100rpx;
      height: 48rpx;
      line-height: 48rpx;
      padding: 0;
      font-size: 20rpx;
      border-radius: 24rpx;
      
      &::after { border: none; }
      
      &.claim {
        background-color: #FFF3E0;
        color: #F57C00;
        border: 1rpx solid #FFB74D;
      }
      
      &.use {
        background-color: transparent;
        color: $primary-color;
        border: 1rpx solid $primary-color;
      }
    }
    
    .status-stamp {
      width: 100rpx;
      height: 100rpx;
      position: absolute;
      right: 10rpx;
      bottom: 10rpx;
      opacity: 0.5;
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