<template>
  <view class="station-detail-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 内容 -->
    <block v-else-if="station">
      <!-- 服务站头部 -->
      <view class="station-header">
        <image
          :src="station.coverImage || '/static/images/station-default.png'"
          class="station-cover"
          mode="aspectFill"
        />
        <view class="header-overlay">
          <view class="station-info">
            <view class="station-name">{{ station.name || '乡村服务站' }}</view>
            <view class="station-tag-row">
              <view class="tag">代购服务</view>
              <view class="tag">快递收发</view>
              <view class="tag">便民驿站</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 基本信息卡片 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-icon">📍</text>
          <view class="info-content">
            <text class="info-label">地址</text>
            <text class="info-value">{{ station.address || '暂无地址信息' }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-icon">👤</text>
          <view class="info-content">
            <text class="info-label">站长</text>
            <text class="info-value">{{ station.masterName || '未知' }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-icon">📞</text>
          <view class="info-content">
            <text class="info-label">联系电话</text>
            <text class="info-value phone-value" @tap="callPhone(station.phone)">
              {{ station.phone || '暂无' }}
            </text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-icon">🕐</text>
          <view class="info-content">
            <text class="info-label">营业时间</text>
            <text class="info-value">{{ station.businessHours || '09:00 - 21:00' }}</text>
          </view>
        </view>
      </view>

      <!-- 服务项目 -->
      <view class="section-card">
        <view class="section-title">提供服务</view>
        <view class="service-grid">
          <view class="service-item" @tap="goPurchase">
            <view class="service-icon">🛍️</view>
            <text class="service-name">代购服务</text>
            <text class="service-desc">帮您进城采购</text>
          </view>
          <view class="service-item">
            <view class="service-icon">📦</view>
            <text class="service-name">快递代收</text>
            <text class="service-desc">代收快递包裹</text>
          </view>
          <view class="service-item">
            <view class="service-icon">🚗</view>
            <text class="service-name">顺风车</text>
            <text class="service-desc">出行更方便</text>
          </view>
          <view class="service-item">
            <view class="service-icon">💬</view>
            <text class="service-name">咨询服务</text>
            <text class="service-desc">政策信息咨询</text>
          </view>
        </view>
      </view>

      <!-- 简介 -->
      <view v-if="station.description" class="section-card">
        <view class="section-title">服务站介绍</view>
        <text class="description-text">{{ station.description }}</text>
      </view>
    </block>

    <!-- 错误状态 -->
    <view v-else class="error-wrap">
      <Empty text="服务站信息不存在" />
    </view>

    <!-- 底部操作栏 -->
    <view v-if="station" class="bottom-bar">
      <view class="btn-call" @tap="callPhone(station.phone)">
        <text class="btn-icon">📞</text>
        <text>联系站长</text>
      </view>
      <view class="btn-purchase" @tap="goPurchase">
        <text>我要代购</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStationStore } from '@/store/modules/station'
import { useUserStore } from '@/store/modules/user'

const stationStore = useStationStore()
const userStore = useUserStore()

const loading = ref(false)
const station = ref(stationStore.currentStation || null)

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id

  if (id && !station.value) {
    loading.value = true
    try {
      station.value = await stationStore.loadStationDetail(id)
    } catch (err) {
      console.error('loadStationDetail error:', err)
    } finally {
      loading.value = false
    }
  }
})

function callPhone(phone) {
  if (!phone) {
    uni.showToast({ title: '暂无联系电话', icon: 'none' })
    return
  }
  uni.makePhoneCall({ phoneNumber: phone })
}

function goPurchase() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  const stationId = station.value?.id
  uni.navigateTo({
    url: `/pages/station/purchase${stationId ? `?stationId=${stationId}` : ''}`
  })
}
</script>

<style lang="scss" scoped>
.station-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.loading-wrap,
.error-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 120rpx 0;

  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

.station-header {
  position: relative;
  width: 100%;
  height: 360rpx;

  .station-cover {
    width: 100%;
    height: 100%;
    display: block;
    background: #e8f5e9;
  }

  .header-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
    padding: 40rpx 30rpx 24rpx;

    .station-info {
      .station-name {
        font-size: 40rpx;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 12rpx;
      }

      .station-tag-row {
        display: flex;
        gap: 12rpx;

        .tag {
          background: rgba(255, 255, 255, 0.2);
          border: 1rpx solid rgba(255, 255, 255, 0.5);
          border-radius: 20rpx;
          padding: 4rpx 16rpx;
          font-size: 22rpx;
          color: #ffffff;
        }
      }
    }
  }
}

.info-card,
.section-card {
  background: #ffffff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .info-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
    line-height: 1.6;
  }

  .info-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-label {
      font-size: 28rpx;
      color: #999;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
      text-align: right;
      flex: 1;
      margin-left: 20rpx;

      &.phone-value {
        color: #4CAF50;
        text-decoration: underline;
      }
    }
  }
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;

  .service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 8rpx;
    border-radius: 12rpx;
    background: #f9f9f9;

    .service-icon {
      font-size: 48rpx;
      margin-bottom: 8rpx;
    }

    .service-name {
      font-size: 24rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 4rpx;
    }

    .service-desc {
      font-size: 20rpx;
      color: #bbb;
    }
  }
}

.description-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .btn-call {
    flex: 1;
    height: 88rpx;
    border: 2rpx solid #4CAF50;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 28rpx;
    color: #4CAF50;

    .btn-icon {
      font-size: 28rpx;
    }
  }

  .btn-purchase {
    flex: 2;
    height: 88rpx;
    background: #4CAF50;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    color: #ffffff;
    font-weight: 600;
  }
}
</style>