<template>
  <view class="search-page">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          v-model="keyword" 
          :focus="true"
          placeholder="搜索商品名称、品类"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <text v-if="keyword" class="clear-icon" @click="keyword = ''">✕</text>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!hasSearched" class="search-history">
      <view class="history-header" v-if="historyList.length > 0">
        <text class="title">搜索历史</text>
        <text class="clear" @click="clearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view 
          class="tag" 
          v-for="(item, index) in historyList" 
          :key="index"
          @click="searchByHistory(item)"
        >
          <text>{{ item }}</text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="hot-search">
        <view class="hot-header">
          <text class="title">热门搜索</text>
        </view>
        <view class="hot-tags">
          <view 
            class="tag hot" 
            v-for="(item, index) in hotList" 
            :key="index"
            @click="searchByHistory(item)"
          >
            <text class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</text>
            <text>{{ item }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-else class="search-result">
      <!-- 排序栏 -->
      <view class="sort-bar">
        <view 
          class="sort-item" 
          :class="{ active: currentSort === 'default' }"
          @click="changeSort('default')"
        >
          <text>综合</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: currentSort === 'sales' }"
          @click="changeSort('sales')"
        >
          <text>销量</text>
        </view>
        <view 
          class="sort-item sort-price" 
          :class="{ active: currentSort.startsWith('price') }"
          @click="changePriceSort"
        >
          <text>价格</text>
          <view class="price-arrows">
            <text class="arrow-up" :class="{ active: currentSort === 'price_asc' }">↑</text>
            <text class="arrow-down" :class="{ active: currentSort === 'price_desc' }">↓</text>
          </view>
        </view>
      </view>

      <!-- 结果列表 -->
      <scroll-view class="result-list" scroll-y @scrolltolower="loadMore">
        <ProductCard 
          v-for="item in resultList" 
          :key="item.id" 
          :product="item" 
          @click="goDetail" 
        />
        
        <view v-if="loading" class="loading-more"><text>加载中...</text></view>
        <view v-if="!loading && noMore && resultList.length > 0" class="no-more"><text>没有更多了</text></view>
        <Empty v-if="!loading && resultList.length === 0" text="未找到相关商品" />
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { searchProducts } from '@/api/product'
import { getStorage, setStorage } from '@/utils/storage'

const HISTORY_KEY = 'xlxq_search_history'
const MAX_HISTORY = 20

const keyword = ref('')
const hasSearched = ref(false)
const historyList = ref([])
const hotList = ref(['新鲜蔬菜', '应季水果', '农资化肥', '土鸡蛋', '大米', '食用油', '调味品', '日用品'])
const resultList = ref([])
const currentSort = ref('default')
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)

onLoad((options) => {
  // 从外部传入关键词
  if (options.keyword) {
    keyword.value = options.keyword
    handleSearch()
  }
  
  // 加载搜索历史
  loadHistory()
})

const loadHistory = () => {
  const history = getStorage(HISTORY_KEY)
  if (history) {
    historyList.value = JSON.parse(history)
  }
}

const saveHistory = (kw) => {
  // 去重并放到首位
  historyList.value = historyList.value.filter(item => item !== kw)
  historyList.value.unshift(kw)
  if (historyList.value.length > MAX_HISTORY) {
    historyList.value = historyList.value.slice(0, MAX_HISTORY)
  }
  setStorage(HISTORY_KEY, JSON.stringify(historyList.value))
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        historyList.value = []
        setStorage(HISTORY_KEY, '[]')
      }
    }
  })
}

const handleSearch = () => {
  const kw = keyword.value.trim()
  if (!kw) return
  
  saveHistory(kw)
  hasSearched.value = true
  page.value = 1
  noMore.value = false
  resultList.value = []
  fetchResults()
}

const searchByHistory = (kw) => {
  keyword.value = kw
  handleSearch()
}

const changeSort = (sort) => {
  currentSort.value = sort
  page.value = 1
  noMore.value = false
  resultList.value = []
  fetchResults()
}

const changePriceSort = () => {
  if (currentSort.value === 'price_asc') {
    currentSort.value = 'price_desc'
  } else {
    currentSort.value = 'price_asc'
  }
  page.value = 1
  noMore.value = false
  resultList.value = []
  fetchResults()
}

const fetchResults = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  
  try {
    const res = await searchProducts({
      keyword: keyword.value,
      sort: currentSort.value,
      page: page.value,
      pageSize: 20
    })
    
    const newList = res.list || []
    resultList.value = [...resultList.value, ...newList]
    
    if (newList.length < 20) {
      noMore.value = true
    }
    page.value++
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!noMore.value && !loading.value) {
    fetchResults()
  }
}

const goDetail = (product) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${product.id}` })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.search-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

// 搜索框
.search-header {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  background-color: #fff;
  padding-top: calc(var(--status-bar-height, 20px) + #{$spacing-sm});
  
  .search-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    height: 68rpx;
    background-color: $bg-gray;
    border-radius: $radius-round;
    padding: 0 $spacing-base;
    
    .search-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }
    
    .search-input {
      flex: 1;
      font-size: $font-size-base;
      color: $text-primary;
    }
    
    .clear-icon {
      font-size: 28rpx;
      color: $text-secondary;
      padding: 8rpx;
    }
  }
  
  .cancel-btn {
    margin-left: $spacing-base;
    font-size: $font-size-base;
    color: $text-regular;
  }
}

// 搜索历史
.search-history {
  padding: $spacing-base;
  
  .history-header, .hot-header {
    @include flex-between;
    margin-bottom: $spacing-sm;
    
    .title {
      font-size: $font-size-md;
      font-weight: bold;
      color: $text-primary;
    }
    
    .clear {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
  
  .history-tags, .hot-tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: $spacing-lg;
    
    .tag {
      padding: 12rpx 24rpx;
      background-color: #fff;
      border-radius: $radius-round;
      margin-right: $spacing-sm;
      margin-bottom: $spacing-sm;
      font-size: $font-size-sm;
      color: $text-regular;
    }
  }
  
  .hot-tags .tag {
    display: flex;
    align-items: center;
    
    .rank {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-right: 8rpx;
      font-weight: bold;
      width: 32rpx;
      
      &.top {
        color: $secondary-color;
      }
    }
  }
}

// 排序栏
.sort-bar {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 $spacing-base;
  background-color: #fff;
  border-bottom: 1rpx solid $border-light;
  
  .sort-item {
    flex: 1;
    @include flex-center;
    font-size: $font-size-base;
    color: $text-regular;
    
    &.active {
      color: $primary-color;
      font-weight: bold;
    }
  }
  
  .sort-price {
    .price-arrows {
      display: flex;
      flex-direction: column;
      margin-left: 4rpx;
      line-height: 1;
      
      .arrow-up, .arrow-down {
        font-size: 18rpx;
        color: $text-placeholder;
        
        &.active {
          color: $primary-color;
        }
      }
    }
  }
}

// 搜索结果
.search-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .result-list {
    flex: 1;
    height: 0;
    padding: $spacing-sm $spacing-base;
  }
}

.loading-more, .no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: $text-secondary;
}
</style>