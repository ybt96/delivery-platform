<template>
  <view class="alliance-page">
    <!-- 头部搜索与定位 -->
    <view class="header-section">
      <view class="location" @click="chooseLocation">
        <text class="icon">📍</text>
        <text class="text">{{ currentAddress }}</text>
        <text class="arrow">›</text>
      </view>
      <view class="search-wrap">
        <SearchBar disabled placeholder="搜索联盟商家" @click="goSearch" />
      </view>
    </view>
    
    <!-- 联盟特权横幅 -->
    <view class="privilege-banner" @click="goCoupons">
      <view class="content">
        <text class="title">百商联盟会员</text>
        <text class="desc">开通尊享全城百家商户专属折扣</text>
      </view>
      <button class="btn-join">立即开通</button>
    </view>
    
    <!-- 商家分类 -->
    <scroll-view class="category-scroll" scroll-x :show-scrollbar="false">
      <view class="category-list">
        <view 
          class="category-item" 
          :class="{ active: currentCategory === cat.id }"
          v-for="cat in categories" 
          :key="cat.id"
          @click="switchCategory(cat.id)"
        >
          <text>{{ cat.name }}</text>
          <view class="line" v-if="currentCategory === cat.id"></view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 商家列表 -->
    <scroll-view class="merchant-list" scroll-y @scrolltolower="loadMore">
      <view class="merchant-card" v-for="shop in merchants" :key="shop.id" @click="goShop(shop.id)">
        <image class="shop-logo" :src="shop.logo || '/static/images/default-img.png'" mode="aspectFill" />
        <view class="shop-info">
          <view class="shop-header">
            <text class="shop-name">{{ shop.name }}</text>
            <text class="distance">{{ shop.distance }}km</text>
          </view>
          <view class="shop-tags">
            <text class="tag alliance-tag">联盟商家</text>
            <text class="tag cat-tag">{{ shop.categoryName }}</text>
          </view>
          <view class="discount-info">
            <text class="icon">惠</text>
            <text class="text">{{ shop.discountDesc }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="loading" class="loading-more"><text>加载中...</text></view>
      <view v-if="!loading && noMore && merchants.length > 0" class="no-more"><text>没有更多了</text></view>
      <Empty v-if="!loading && merchants.length === 0" text="暂无联盟商家" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAllianceMerchants } from '@/api/alliance'

const currentAddress = ref('某某乡某某村')
const currentCategory = ref('all')
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)

const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'cater', name: '餐饮美食' },
  { id: 'supermarket', name: '商超便利' },
  { id: 'life', name: '生活服务' },
  { id: 'entertainment', name: '休闲娱乐' }
])

const merchants = ref([])

onLoad(() => {
  fetchMerchants()
})

const fetchMerchants = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  
  try {
    const res = await getAllianceMerchants({
      category: currentCategory.value === 'all' ? '' : currentCategory.value,
      page: page.value,
      pageSize: 10
    })
    
    // 模拟数据
    const mockData = [
      { id: '1', name: '老王农家乐', logo: '', distance: '1.2', categoryName: '餐饮美食', discountDesc: '联盟会员全场8.8折' },
      { id: '2', name: '天天平价超市', logo: '', distance: '0.8', categoryName: '商超便利', discountDesc: '满100减15' },
      { id: '3', name: '乡村理发店', logo: '', distance: '2.5', categoryName: '生活服务', discountDesc: '联盟会员单次减5元' }
    ]
    
    const list = res.list || mockData
    merchants.value = [...merchants.value, ...list]
    
    if (list.length < 10) {
      noMore.value = true
    }
    page.value++
  } catch (error) {
    console.error('获取商家失败', error)
  } finally {
    loading.value = false
  }
}

const switchCategory = (id) => {
  if (currentCategory.value === id) return
  currentCategory.value = id
  page.value = 1
  noMore.value = false
  merchants.value = []
  fetchMerchants()
}

const loadMore = () => {
  if (!noMore.value && !loading.value) {
    fetchMerchants()
  }
}

const chooseLocation = () => {
  uni.showToast({ title: '选择位置', icon: 'none' })
}

const goSearch = () => {
  uni.navigateTo({ url: '/pages/product/search?type=merchant' })
}

const goCoupons = () => {
  uni.navigateTo({ url: '/pages/alliance/coupons' })
}

const goShop = (id) => {
  uni.navigateTo({ url: `/pages/product/list?shopId=${id}` })
}
</script>

<style lang="scss" scoped>
.alliance-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
}

// 头部
.header-section {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  background-color: #fff;
  
  .location {
    display: flex;
    align-items: center;
    max-width: 240rpx;
    margin-right: $spacing-sm;
    
    .icon { font-size: 32rpx; margin-right: 4rpx; }
    .text { font-size: $font-size-base; @include ellipsis(1); }
    .arrow { font-size: 32rpx; color: $text-secondary; margin-left: 4rpx; }
  }
  
  .search-wrap {
    flex: 1;
    :deep(.search-bar) { padding: 0; }
  }
}

// 联盟横幅
.privilege-banner {
  margin: $spacing-sm $spacing-base;
  background: linear-gradient(135deg, #FFB74D, #F57C00);
  border-radius: $radius-base;
  padding: $spacing-md $spacing-base;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  
  .content {
    display: flex;
    flex-direction: column;
    
    .title {
      font-size: $font-size-lg;
      font-weight: bold;
      margin-bottom: 8rpx;
    }
    
    .desc {
      font-size: $font-size-sm;
      opacity: 0.9;
    }
  }
  
  .btn-join {
    margin: 0;
    padding: 0 32rpx;
    height: 60rpx;
    line-height: 60rpx;
    background-color: #fff;
    color: #F57C00;
    font-size: $font-size-sm;
    font-weight: bold;
    border-radius: 30rpx;
    
    &::after { border: none; }
  }
}

// 分类
.category-scroll {
  background-color: #fff;
  white-space: nowrap;
  border-bottom: 1rpx solid $border-light;
  
  .category-list {
    display: inline-flex;
    padding: 0 $spacing-sm;
    
    .category-item {
      padding: 24rpx 32rpx;
      position: relative;
      font-size: $font-size-base;
      color: $text-regular;
      
      &.active {
        color: $primary-color;
        font-weight: bold;
      }
      
      .line {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 6rpx;
        background-color: $primary-color;
        border-radius: 3rpx;
      }
    }
  }
}

// 商家列表
.merchant-list {
  flex: 1;
  height: 0;
  padding: $spacing-sm;
}

.merchant-card {
  display: flex;
  background-color: #fff;
  border-radius: $radius-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;
  
  .shop-logo {
    width: 140rpx;
    height: 140rpx;
    border-radius: $radius-sm;
    margin-right: $spacing-sm;
    background-color: $bg-gray;
  }
  
  .shop-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .shop-header {
      @include flex-between;
      
      .shop-name {
        font-size: $font-size-md;
        font-weight: bold;
        color: $text-primary;
        @include ellipsis(1);
      }
      
      .distance {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }
    
    .shop-tags {
      display: flex;
      margin: 8rpx 0;
      
      .tag {
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        margin-right: 12rpx;
        
        &.alliance-tag {
          color: #F57C00;
          background-color: #FFF3E0;
        }
        
        &.cat-tag {
          color: $text-secondary;
          background-color: $bg-gray;
        }
      }
    }
    
    .discount-info {
      display: flex;
      align-items: center;
      
      .icon {
        width: 32rpx;
        height: 32rpx;
        @include flex-center;
        background-color: $price-color;
        color: #fff;
        font-size: 20rpx;
        border-radius: 4rpx;
        margin-right: 8rpx;
      }
      
      .text {
        font-size: $font-size-xs;
        color: $text-regular;
        @include ellipsis(1);
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