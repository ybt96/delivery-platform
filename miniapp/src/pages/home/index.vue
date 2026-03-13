<template>
  <view class="home-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="location" @click="chooseLocation">
          <text class="icon">📍</text>
          <text class="text">{{ currentAddress || '定位中...' }}</text>
          <text class="arrow">›</text>
        </view>
        <view class="search-wrap">
          <SearchBar disabled placeholder="搜索乡里乡亲好物" @click="goSearch" />
        </view>
      </view>
    </view>

    <!-- 主体内容区，使用 scroll-view 支持滚动和下拉刷新 -->
    <scroll-view 
      class="main-scroll" 
      scroll-y 
      enable-back-to-top
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 轮播图 -->
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" circular indicator-active-color="#4CAF50">
        <swiper-item v-for="(item, index) in banners" :key="index" @click="handleBannerClick(item)">
          <image :src="item.image" mode="aspectFill" class="banner-image" />
        </swiper-item>
      </swiper>

      <!-- 金刚区 / 快捷导航 -->
      <view class="nav-grid">
        <view class="nav-item" v-for="(item, index) in quickNavs" :key="index" @click="goNav(item.path)">
          <image class="nav-icon" :src="item.icon" mode="aspectFit" />
          <text class="nav-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 营销专区 (联盟优惠、顺风车等) -->
      <view class="marketing-section">
        <view class="market-card alliance" @click="goNav('/pages/alliance/index')">
          <view class="market-info">
            <text class="market-title">百商联盟</text>
            <text class="market-desc">专属会员优惠</text>
          </view>
          <image class="market-img" src="https://dummyimage.com/80/ffebee/9C27B0&text=Alli" mode="aspectFit" />
        </view>
        <view class="market-card carpool" @click="goNav('/pages/carpool/index')">
          <view class="market-info">
            <text class="market-title">乡村顺风车</text>
            <text class="market-desc">便捷出行不等待</text>
          </view>
          <image class="market-img" src="https://dummyimage.com/80/e3f2fd/1565c0&text=Car" mode="aspectFit" />
        </view>
      </view>

      <!-- 为你推荐 / 热门商品 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="title">猜你喜欢</text>
        </view>
        <view class="product-grid">
          <ProductCard 
            v-for="item in recommendList" 
            :key="item.id" 
            :product="{
              ...item,
              allianceInfo: item.allianceDiscount ? {
                isAlliance: true,
                discount: Math.round((item.alliancePrice / item.price) * 10)
              } : null,
              shopName: '乡里乡亲精选',
              distance: Math.floor(Math.random() * 5000)
            }" 
            @click="goProductDetail(item)" 
          />
        </view>
        
        <!-- 加载状态 -->
        <view v-if="loading" class="loading-more"><text>加载中...</text></view>
        <view v-if="!loading && noMore" class="no-more"><text>没有更多了</text></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHotProducts } from '@/api/product'

// 状态变量
const statusBarHeight = ref(20)
const currentAddress = ref('某某乡某某村')
const isRefreshing = ref(false)
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)

// 数据列表
const banners = ref([
  { id: 1, image: 'https://dummyimage.com/750x300/4CAF50/FFFFFF&text=Banner+1' },
  { id: 2, image: 'https://dummyimage.com/750x300/FF9800/FFFFFF&text=Banner+2' }
])

const quickNavs = ref([
  { name: '新鲜蔬菜', icon: 'https://dummyimage.com/80/e8f5e9/4CAF50&text=Veg', path: '/pages/product/list?category=1' },
  { name: '当季水果', icon: 'https://dummyimage.com/80/fff3e0/FF9800&text=Fru', path: '/pages/product/list?category=2' },
  { name: '农资农具', icon: 'https://dummyimage.com/80/e3f2fd/FF5722&text=Tool', path: '/pages/product/list?category=3' },
  { name: '日用百货', icon: 'https://dummyimage.com/80/f3e5f5/2196F3&text=Day', path: '/pages/product/list?category=4' },
  { name: '联盟优惠', icon: 'https://dummyimage.com/80/ffebee/9C27B0&text=Alli', path: '/pages/alliance/index' }
])

const recommendList = ref([])

onLoad(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  fetchData()
})

// 获取页面数据
const fetchData = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true
  
  if (isRefresh) {
    page.value = 1
    noMore.value = false
  }

  try {
    const take = 10
    const skip = (page.value - 1) * take
    const res = await getHotProducts({ skip, take })
    const newList = Array.isArray(res) ? (res[0] || []) : (res.list || res.items || [])

    if (isRefresh || page.value === 1) {
      recommendList.value = newList
    } else {
      recommendList.value = [...recommendList.value, ...newList]
    }

    if (newList.length < take) {
      noMore.value = true
    }
    page.value++
  } catch (error) {
    console.error('获取首页数据失败', error)
    // 降级处理，使用模拟数据
    if (isRefresh || page.value === 1) {
      recommendList.value = mockProducts()
      noMore.value = true
    }
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true
  fetchData(true)
}

// 触底加载
const loadMore = () => {
  if (!noMore.value) {
    fetchData()
  }
}

// 导航操作
const goSearch = () => {
  uni.navigateTo({ url: '/pages/product/search' })
}

const chooseLocation = () => {
  // 实际项目中可以调用地图选择或地址列表
  uni.navigateTo({ url: '/pages/user/address-list?select=true' })
}

const goNav = (path) => {
  if (!path) return
  // 处理 tabBar 页面
  const tabBarPages = ['/pages/home/index', '/pages/product/list', '/pages/cart/index', '/pages/user/index']
  if (tabBarPages.includes(path.split('?')[0])) {
    uni.switchTab({ url: path })
  } else {
    uni.navigateTo({ url: path })
  }
}

const goProductDetail = (product) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${product.id}` })
}

const handleBannerClick = (item) => {
  if (item.path) {
    goNav(item.path)
  }
}

// 模拟数据
const mockProducts = () => {
  return Array(6).fill(0).map((_, i) => ({
    id: `mock_${i}`,
    name: `乡里乡亲严选商品 ${i + 1}`,
    price: (Math.random() * 100).toFixed(2),
    originalPrice: (Math.random() * 150 + 50).toFixed(2),
    sales: Math.floor(Math.random() * 1000),
    image: `https://dummyimage.com/300x300/e0e0e0/999999&text=Product+${i + 1}`,
    allianceDiscount: i % 3 === 0,
    alliancePrice: (Math.random() * 80).toFixed(2)
  }))
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
}

// 自定义导航栏
.custom-nav {
  background-color: $primary-color;
  position: relative;
  z-index: 100;
  
  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 $spacing-base;
    
    .location {
      display: flex;
      align-items: center;
      color: #fff;
      margin-right: $spacing-base;
      max-width: 200rpx;
      
      .icon {
        font-size: 32rpx;
        margin-right: 4rpx;
      }
      
      .text {
        font-size: $font-size-md;
        @include ellipsis(1);
      }
      
      .arrow {
        font-size: 32rpx;
        margin-left: 4rpx;
      }
    }
    
    .search-wrap {
      flex: 1;
      // 穿透覆盖 SearchBar 的部分样式
      :deep(.search-bar) {
        padding: 0;
        background-color: transparent;
        .search-inner {
          background-color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}

.main-scroll {
  flex: 1;
  height: 0; // 配合 flex: 1 实现滚动
}

// 轮播图
.banner-swiper {
  width: 100%;
  height: 300rpx;
  background-color: #fff;
  
  .banner-image {
    width: 100%;
    height: 100%;
  }
}

// 金刚区
.nav-grid {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;
  padding: $spacing-md 0 $spacing-sm;
  
  .nav-item {
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: $spacing-sm;
    
    .nav-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      margin-bottom: 12rpx;
    }
    
    .nav-text {
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }
}

// 营销专区
.marketing-section {
  display: flex;
  padding: $spacing-sm $spacing-base;
  
  .market-card {
    flex: 1;
    height: 140rpx;
    border-radius: $radius-base;
    padding: $spacing-sm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &.alliance {
      background: linear-gradient(135deg, #fff3e0, #ffe0b2);
      margin-right: $spacing-sm;
      
      .market-title { color: #d84315; }
    }
    
    &.carpool {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      
      .market-title { color: #1565c0; }
    }
    
    .market-info {
      display: flex;
      flex-direction: column;
      
      .market-title {
        font-size: $font-size-md;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      
      .market-desc {
        font-size: $font-size-xs;
        color: $text-secondary;
      }
    }
    
    .market-img {
      width: 80rpx;
      height: 80rpx;
    }
  }
}

// 推荐专区
.recommend-section {
  padding: 0 $spacing-base $spacing-base;
  
  .section-header {
    padding: $spacing-base 0;
    text-align: center;
    
    .title {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
      position: relative;
      display: inline-block;
      
      &::before, &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40rpx;
        height: 2rpx;
        background-color: $text-placeholder;
      }
      
      &::before { left: -60rpx; }
      &::after { right: -60rpx; }
    }
  }
  
  .product-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    
    // ProductCard 默认为单列，我们需要在 grid 模式下覆盖它的宽度
    :deep(.product-card) {
      width: calc(50% - 10rpx);
      margin: 0 0 20rpx 0;
      flex-direction: column;
      
      .product-img {
        width: 100%;
        height: 330rpx;
      }
      
      .product-info {
        padding: 16rpx;
      }
      
      .btn-add-cart {
        bottom: 16rpx;
        right: 16rpx;
      }
    }
  }
}

.loading-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>