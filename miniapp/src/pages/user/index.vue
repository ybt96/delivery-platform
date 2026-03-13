<template>
  <view class="user-page">
    <!-- 顶部用户信息卡 -->
    <view class="user-hero">
      <!-- 头像 + 基本信息 -->
      <view class="hero-user-row" @click="handleLogin">
        <view class="avatar-wrap">
          <image
            class="avatar"
            :src="userInfo.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          />
          <view v-if="!isLoggedIn" class="avatar-hint">
            <text>登录</text>
          </view>
        </view>

        <view class="hero-info">
          <text class="hero-nickname">{{ userInfo.nickname || '立即登录' }}</text>
          <text v-if="isLoggedIn && userInfo.phone" class="hero-phone">{{ formatPhone(userInfo.phone) }}</text>
          <text v-if="!isLoggedIn" class="hero-desc">登录后查看订单、优惠券、积分</text>
        </view>

        <view class="hero-arrow">
          <text>›</text>
        </view>
      </view>

      <!-- 登录后：资产统计卡 -->
      <view v-if="isLoggedIn" class="asset-row">
        <view class="asset-item" @click="goPage('/pages/user/wallet')">
          <text class="asset-val">{{ stats.balance || '0.00' }}</text>
          <text class="asset-label">余额(元)</text>
        </view>
        <view class="asset-divider"></view>
        <view class="asset-item" @click="goPage('/pages/alliance/coupons')">
          <text class="asset-val">{{ stats.couponCount || 0 }}</text>
          <text class="asset-label">优惠券</text>
        </view>
        <view class="asset-divider"></view>
        <view class="asset-item" @click="goPage('/pages/user/points')">
          <text class="asset-val">{{ stats.points || 0 }}</text>
          <text class="asset-label">积分</text>
        </view>
      </view>
    </view>

    <!-- 主体内容（滚动区） -->
    <scroll-view class="user-body" scroll-y>
      <!-- ---- 订单中心 ---- -->
      <view class="section-label">我的订单</view>
      <view class="section-card">
        <view class="section-card__header" @click="goOrderList('')">
          <text class="section-card__title">订单中心</text>
          <text class="section-card__more">全部订单 ›</text>
        </view>
        <view class="order-grid">
          <view class="order-tab" @click="goOrderList('pending_payment')">
            <view class="order-tab__icon-wrap">
              <text class="order-tab__icon">💳</text>
              <view v-if="orderCounts.pending_payment" class="badge">{{ orderCounts.pending_payment }}</view>
            </view>
            <text class="order-tab__text">待付款</text>
          </view>
          <view class="order-tab" @click="goOrderList('pending_delivery')">
            <view class="order-tab__icon-wrap">
              <text class="order-tab__icon">📦</text>
              <view v-if="orderCounts.pending_delivery" class="badge">{{ orderCounts.pending_delivery }}</view>
            </view>
            <text class="order-tab__text">待发货</text>
          </view>
          <view class="order-tab" @click="goOrderList('delivering')">
            <view class="order-tab__icon-wrap">
              <text class="order-tab__icon">🚚</text>
              <view v-if="orderCounts.delivering" class="badge">{{ orderCounts.delivering }}</view>
            </view>
            <text class="order-tab__text">配送中</text>
          </view>
          <view class="order-tab" @click="goOrderList('pending_comment')">
            <view class="order-tab__icon-wrap">
              <text class="order-tab__icon">⭐</text>
              <view v-if="orderCounts.pending_comment" class="badge">{{ orderCounts.pending_comment }}</view>
            </view>
            <text class="order-tab__text">待评价</text>
          </view>
          <view class="order-tab" @click="goOrderList('after_sale')">
            <view class="order-tab__icon-wrap">
              <text class="order-tab__icon">🔧</text>
            </view>
            <text class="order-tab__text">售后</text>
          </view>
        </view>
      </view>

      <!-- ---- 常用服务 ---- -->
      <view class="section-label">常用服务</view>
      <view class="menu-card">
        <view class="menu-item" @click="goPage('/pages/user/address-list')">
          <view class="menu-icon-wrap menu-icon-wrap--blue">
            <text class="menu-icon">📍</text>
          </view>
          <text class="menu-text">地址管理</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/alliance/coupons')">
          <view class="menu-icon-wrap menu-icon-wrap--orange">
            <text class="menu-icon">🎫</text>
          </view>
          <text class="menu-text">领券中心</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/user/favorites')">
          <view class="menu-icon-wrap menu-icon-wrap--red">
            <text class="menu-icon">❤️</text>
          </view>
          <text class="menu-text">我的收藏</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- ---- 特色服务 ---- -->
      <view class="section-label">特色服务</view>
      <view class="menu-card">
        <view class="menu-item" @click="goPage('/pages/carpool/index')">
          <view class="menu-icon-wrap menu-icon-wrap--green">
            <text class="menu-icon">🚗</text>
          </view>
          <text class="menu-text">乡村顺风车</text>
          <text class="menu-arrow">›</text>
        </view>

        <!-- 角色专属入口 -->
        <template v-if="isLoggedIn">
          <view v-if="hasRole('merchant')" class="menu-item" @click="goMerchantCenter">
            <view class="menu-icon-wrap menu-icon-wrap--purple">
              <text class="menu-icon">🏪</text>
            </view>
            <text class="menu-text">商家中心</text>
            <text class="menu-arrow">›</text>
          </view>
          <view v-if="hasRole('driver')" class="menu-item" @click="goDriverCenter">
            <view class="menu-icon-wrap menu-icon-wrap--teal">
              <text class="menu-icon">🛵</text>
            </view>
            <text class="menu-text">配送员中心</text>
            <text class="menu-arrow">›</text>
          </view>
          <view v-if="hasRole('stationmaster')" class="menu-item" @click="goStationCenter">
            <view class="menu-icon-wrap menu-icon-wrap--brown">
              <text class="menu-icon">🏢</text>
            </view>
            <text class="menu-text">乡村站长中心</text>
            <text class="menu-arrow">›</text>
          </view>
        </template>
      </view>

      <!-- ---- 系统 ---- -->
      <view class="section-label">系统</view>
      <view class="menu-card">
        <view class="menu-item" @click="contactService">
          <view class="menu-icon-wrap menu-icon-wrap--cyan">
            <text class="menu-icon">🎧</text>
          </view>
          <text class="menu-text">联系客服</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goPage('/pages/user/settings')">
          <view class="menu-icon-wrap menu-icon-wrap--gray">
            <text class="menu-icon">⚙️</text>
          </view>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view v-if="isLoggedIn" class="logout-wrap">
        <view class="btn-logout" @click="handleLogout">退出登录</view>
      </view>

      <!-- 底部安全区 -->
      <view class="page-bottom-safe"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { getUserInfo } from '@/api/auth'

const userStore = useUserStore()
const { userInfo, isLoggedIn } = storeToRefs(userStore)

const stats = ref({
  balance: '0.00',
  couponCount: 2,
  points: 150
})

const orderCounts = ref({
  pending_payment: 1,
  pending_delivery: 0,
  delivering: 2,
  pending_comment: 0
})

onShow(() => {
  if (isLoggedIn.value) {
    fetchUserData()
  }
})

const fetchUserData = async () => {
  try {
    const res = await getUserInfo()
    userStore.setUserInfo(res)
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const handleLogin = () => {
  if (!isLoggedIn.value) {
    uni.navigateTo({ url: '/pages/auth/login' })
  } else {
    uni.navigateTo({ url: '/pages/user/profile' })
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    }
  })
}

const goPage = (url) => {
  if (!isLoggedIn.value) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }

  const fallbackPages = {
    '/pages/user/favorites': {
      title: '收藏功能待开发，先为你打开商品列表',
      action: () => uni.switchTab({ url: '/pages/product/list' })
    },
    '/pages/user/settings': {
      title: '设置页待开发，请先在个人信息页维护资料',
      action: () => uni.navigateTo({ url: '/pages/user/profile' })
    },
    '/pages/user/wallet': {
      title: '钱包功能待开发，先为你打开优惠券中心',
      action: () => uni.navigateTo({ url: '/pages/alliance/coupons' })
    },
    '/pages/user/points': {
      title: '积分功能待开发，先为你打开我的代购',
      action: () => uni.navigateTo({ url: '/pages/station/orders' })
    }
  }

  const fallback = fallbackPages[url]
  if (fallback) {
    uni.showToast({ title: fallback.title, icon: 'none' })
    return setTimeout(() => fallback.action(), 400)
  }

  uni.navigateTo({ url })
}

const goOrderList = (status) => {
  if (!isLoggedIn.value) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  uni.navigateTo({ url: `/pages/order/list?status=${status}` })
}

const contactService = () => {
  uni.makePhoneCall({ phoneNumber: '400-123-4567' })
}

const hasRole = (role) => userStore.hasRole(role)
const goMerchantCenter = () => uni.showToast({ title: '商家端待独立建设', icon: 'none' })
const goDriverCenter = () => uni.showToast({ title: '配送员端待独立建设', icon: 'none' })
const goStationCenter = () => uni.navigateTo({ url: '/pages/station/orders' })
</script>

<style lang="scss" scoped>
.user-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
}

// ---- 英雄区头部 ----
.user-hero {
  background: linear-gradient(160deg, $primary-dark 0%, $primary-color 55%, $primary-light 100%);
  padding: calc(var(--status-bar-height, 44px) + 32rpx) $spacing-base 0;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(56, 142, 60, 0.3);
}

.hero-user-row {
  display: flex;
  align-items: center;
  padding-bottom: $spacing-md;
  &:active { opacity: 0.88; }
}

.avatar-wrap {
  position: relative;
  margin-right: $spacing-base;
  flex-shrink: 0;

  .avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255,255,255,0.6);
    background-color: rgba(255,255,255,0.2);
  }

  .avatar-hint {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40rpx;
    background-color: rgba(0,0,0,0.35);
    border-radius: 0 0 56rpx 56rpx;
    display: flex;
    justify-content: center;
    align-items: center;

    text {
      font-size: 18rpx;
      color: #fff;
    }
  }
}

.hero-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .hero-nickname {
    font-size: $font-size-xl;
    font-weight: bold;
    color: #fff;
  }

  .hero-phone {
    font-size: $font-size-sm;
    color: rgba(255,255,255,0.85);
  }

  .hero-desc {
    font-size: $font-size-xs;
    color: rgba(255,255,255,0.75);
    line-height: 1.5;
  }
}

.hero-arrow {
  font-size: 44rpx;
  color: rgba(255,255,255,0.7);
  margin-left: $spacing-sm;
}

// ---- 资产统计行 ----
.asset-row {
  display: flex;
  align-items: center;
  background-color: rgba(255,255,255,0.15);
  border-radius: $radius-base $radius-base 0 0;
  padding: 20rpx 0;
  margin: 0 (-$spacing-base);
  padding-left: $spacing-base;
  padding-right: $spacing-base;
}

.asset-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  &:active { opacity: 0.8; }

  .asset-val {
    font-size: $font-size-lg;
    font-weight: bold;
    color: #fff;
  }

  .asset-label {
    font-size: $font-size-xs;
    color: rgba(255,255,255,0.8);
  }
}

.asset-divider {
  width: 2rpx;
  height: 44rpx;
  background-color: rgba(255,255,255,0.25);
}

// ---- 可滚动主体 ----
.user-body {
  flex: 1;
  overflow: hidden;
}

// ---- 分组标题 ----
.section-label {
  @include section-label;
}

// ---- 订单卡片 ----
.section-card {
  background-color: #fff;
  margin: 0 $spacing-base $spacing-xs;
  border-radius: $radius-base;
  box-shadow: $elevation-card;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base $spacing-base $spacing-sm;
    border-bottom: 1rpx solid $border-light;

    &:active { background-color: $bg-gray; }
  }

  &__title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }

  &__more {
    font-size: $font-size-xs;
    color: $text-placeholder;
  }
}

// ---- 订单图标网格 ----
.order-grid {
  display: flex;
  justify-content: space-around;
  padding: $spacing-base 0 $spacing-md;
}

.order-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  min-width: 88rpx;

  &:active .order-tab__icon { opacity: 0.7; }

  &__icon-wrap {
    position: relative;
  }

  &__icon {
    font-size: 52rpx;
    display: block;
  }

  &__text {
    font-size: $font-size-xs;
    color: $text-regular;
  }
}

.badge {
  @include badge;
}

// ---- 菜单卡片 ----
.menu-card {
  background-color: #fff;
  margin: 0 $spacing-base $spacing-xs;
  border-radius: $radius-base;
  box-shadow: $elevation-card;
  overflow: hidden;
}

.menu-item {
  @include list-item;

  .menu-icon-wrap {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-sm;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: $spacing-base;
    flex-shrink: 0;

    .menu-icon {
      font-size: 36rpx;
    }

    &--blue   { background-color: rgba(41, 121, 255, 0.1); }
    &--orange { background-color: rgba(255, 152, 0, 0.1); }
    &--red    { background-color: rgba(255, 77, 79, 0.1); }
    &--green  { background-color: rgba(76, 175, 80, 0.1); }
    &--purple { background-color: rgba(156, 39, 176, 0.1); }
    &--teal   { background-color: rgba(0, 150, 136, 0.1); }
    &--brown  { background-color: rgba(121, 85, 72, 0.1); }
    &--cyan   { background-color: rgba(0, 188, 212, 0.1); }
    &--gray   { background-color: rgba(96, 125, 139, 0.1); }
  }

  .menu-text {
    flex: 1;
    font-size: $font-size-base;
    color: $text-primary;
  }

  .menu-arrow {
    font-size: 32rpx;
    color: $text-placeholder;
  }
}

// ---- 退出登录 ----
.logout-wrap {
  padding: $spacing-lg $spacing-base $spacing-md;
}

.btn-logout {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: $radius-round;
  background-color: #fff;
  color: $error-color;
  font-size: $font-size-base;
  box-shadow: $elevation-card;
  letter-spacing: 2rpx;

  &:active { background-color: $bg-gray; }
}

.page-bottom-safe {
  height: $tab-bar-height;
}
</style>