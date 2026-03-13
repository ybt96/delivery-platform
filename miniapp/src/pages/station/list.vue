<template>
  <view class="station-list-page">
    <!-- 顶部搜索 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索附近服务站"
          confirm-type="search"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <!-- 服务站列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
    >
      <!-- 加载中 -->
      <view v-if="stationStore.stationLoading && stationList.length === 0" class="loading-wrap">
        <text class="loading-text">正在加载...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!stationStore.stationLoading && stationList.length === 0" class="empty-wrap">
        <Empty text="暂无附近服务站" />
      </view>

      <!-- 列表 -->
      <view v-else class="station-list">
        <view
          v-for="station in stationList"
          :key="station.id"
          class="station-card"
          @tap="goDetail(station)"
        >
          <view class="card-left">
            <image
              :src="station.avatar || '/static/images/station-default.png'"
              class="station-avatar"
              mode="aspectFill"
            />
          </view>
          <view class="card-body">
            <view class="station-name">{{ station.name || '乡村服务站' }}</view>
            <view class="station-address">
              <text class="addr-icon">📍</text>
              <text class="addr-text">{{ station.address || '地址未填写' }}</text>
            </view>
            <view class="station-meta">
              <view class="meta-item">
                <text class="meta-label">站长：</text>
                <text class="meta-value">{{ station.masterName || '未知' }}</text>
              </view>
              <view class="meta-item">
                <text class="meta-label">服务：</text>
                <text class="meta-value">代购 · 收发快递</text>
              </view>
            </view>
          </view>
          <view class="card-right">
            <view class="distance-badge">
              <text class="distance-text">{{ formatDistance(station.distance) }}</text>
            </view>
            <view class="arrow-icon">›</view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="stationList.length > 0" class="load-more">
        <text class="load-more-text">已显示全部服务站</text>
      </view>
    </scroll-view>

    <!-- 快速入口 FAB -->
    <view class="fab-btn" @tap="goPurchase">
      <text class="fab-icon">🛍️</text>
      <text class="fab-text">我要代购</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStationStore } from '@/store/modules/station'
import { useUserStore } from '@/store/modules/user'

const stationStore = useStationStore()
const userStore = useUserStore()
const searchKeyword = ref('')

const stationList = computed(() => stationStore.stationList)

onMounted(() => {
  loadStations()
})

async function loadStations() {
  await stationStore.loadStations({ keyword: searchKeyword.value })
}

function handleSearch() {
  loadStations()
}

function loadMore() {
  // 服务站列表当前不分页，后端接口待完善
}

function formatDistance(distance) {
  if (!distance && distance !== 0) return '未知'
  if (distance < 1000) return `${distance}m`
  return `${(distance / 1000).toFixed(1)}km`
}

function goDetail(station) {
  stationStore.setCurrentStation(station)
  uni.navigateTo({
    url: `/pages/station/detail?id=${station.id}`
  })
}

function goPurchase() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url: '/pages/station/purchase' })
}
</script>

<style lang="scss" scoped>
.station-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.search-bar {
  background: #ffffff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 10;

  .search-input-wrap {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 36rpx;
    padding: 14rpx 24rpx;

    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
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
  justify-content: center;
  align-items: center;
  padding: 120rpx 0;

  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

.station-list {
  padding: 20rpx;
}

.station-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  .card-left {
    margin-right: 20rpx;

    .station-avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 12rpx;
      background: #f0f0f0;
    }
  }

  .card-body {
    flex: 1;

    .station-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 10rpx;
    }

    .station-address {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12rpx;

      .addr-icon {
        font-size: 24rpx;
        margin-right: 6rpx;
        line-height: 1.4;
      }

      .addr-text {
        font-size: 24rpx;
        color: #999;
        flex: 1;
        line-height: 1.4;
      }
    }

    .station-meta {
      display: flex;
      gap: 24rpx;

      .meta-item {
        display: flex;
        align-items: center;

        .meta-label {
          font-size: 22rpx;
          color: #bbb;
        }

        .meta-value {
          font-size: 22rpx;
          color: #666;
        }
      }
    }
  }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 12rpx;

    .distance-badge {
      background: #e8f5e9;
      border-radius: 20rpx;
      padding: 4rpx 12rpx;
      margin-bottom: 16rpx;

      .distance-text {
        font-size: 22rpx;
        color: #4CAF50;
      }
    }

    .arrow-icon {
      font-size: 32rpx;
      color: #ccc;
    }
  }
}

.load-more {
  text-align: center;
  padding: 24rpx 0;

  .load-more-text {
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
    margin-right: 8rpx;
  }

  .fab-text {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 500;
  }
}
</style>