<template>
  <view class="product-list-page">
    <!-- 吸顶搜索区 -->
    <view class="sticky-header">
      <SearchBar
        :disabled="true"
        placeholder="搜索商品、商家"
        @click="goSearch"
      />

      <!-- 分类标签横滑 -->
      <scroll-view class="category-tabs" scroll-x :scroll-left="categoryScrollLeft">
        <view class="category-tabs__inner">
          <view
            v-for="(item, index) in categories"
            :key="index"
            class="category-tab"
            :class="{ 'category-tab--active': currentCategory === index }"
            @click="switchCategory(index)"
          >
            <text>{{ item.name }}</text>
            <view v-if="currentCategory === index" class="category-tab__line"></view>
          </view>
        </view>
      </scroll-view>

      <!-- 排序条 -->
      <view class="sort-bar">
        <view
          v-for="item in sortOptions"
          :key="item.value"
          class="sort-item"
          :class="{ 'sort-item--active': currentSort === item.value }"
          @click="switchSort(item.value)"
        >
          <text>{{ item.label }}</text>
          <!-- 价格排序箭头 -->
          <view v-if="item.value === 'price'" class="sort-arrows">
            <text class="arrow-up" :class="{ 'arrow--active': currentSort === 'price' && priceAsc }">▲</text>
            <text class="arrow-down" :class="{ 'arrow--active': currentSort === 'price' && !priceAsc }">▼</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品列表主体 -->
    <scroll-view
      class="product-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- Skeleton 骨架屏（首次加载） -->
      <template v-if="isFirstLoad && loading">
        <view v-for="i in 5" :key="`sk-${i}`" class="skeleton-card">
          <view class="sk-img"></view>
          <view class="sk-info">
            <view class="sk-line sk-line--long"></view>
            <view class="sk-line sk-line--short"></view>
            <view class="sk-line sk-line--mid"></view>
          </view>
        </view>
      </template>

      <!-- 正常列表 -->
      <template v-else>
        <ProductCard
          v-for="item in products"
          :key="item.id"
          :product="item"
          :show-cart="true"
          @click="goDetail"
          @add-cart="addToCart"
        />

        <!-- 加载更多 -->
        <view v-if="loading && !isFirstLoad" class="list-footer">
          <view class="loading-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
          <text class="footer-text">加载中</text>
        </view>

        <!-- 无更多 -->
        <view v-if="!loading && noMore && products.length > 0" class="list-footer">
          <view class="no-more-line"></view>
          <text class="footer-text">已显示全部商品</text>
          <view class="no-more-line"></view>
        </view>

        <!-- 空态 -->
        <view v-if="!loading && products.length === 0" class="empty-state">
          <view class="empty-icon">🛒</view>
          <text class="empty-title">暂无相关商品</text>
          <text class="empty-desc">换个分类或关键词试试</text>
          <view class="empty-actions">
            <view class="btn-reset" @click="resetFilters">重置筛选</view>
            <view class="btn-home" @click="goHome">去首页逛逛</view>
          </view>
        </view>

        <!-- 网络异常 -->
        <view v-if="hasError && products.length === 0" class="error-state">
          <view class="error-icon">📡</view>
          <text class="error-text">网络开小差了</text>
          <view class="btn-retry" @click="retryFetch">点击重试</view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProducts } from '@/api/product'
import { useCartStore } from '@/store/modules/cart'

const cartStore = useCartStore()

const categories = ref([
  { id: 0, name: '全部' },
  { id: 1, name: '生鲜果蔬' },
  { id: 2, name: '米面粮油' },
  { id: 3, name: '日用百货' },
  { id: 4, name: '家居家电' },
  { id: 5, name: '服饰鞋包' }
])

const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '销量', value: 'sales' },
  { label: '价格', value: 'price' },
  { label: '距离', value: 'distance' }
]

const currentCategory = ref(0)
const categoryScrollLeft = ref(0)
const currentSort = ref('default')
const priceAsc = ref(true)
const products = ref([])
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)
const hasError = ref(false)
const isFirstLoad = ref(true)
const page = ref(1)

onLoad((options) => {
  if (options.categoryId) {
    currentCategory.value = Number(options.categoryId)
  }
  fetchProducts()
})

const fetchProducts = async () => {
  if (loading.value) return
  loading.value = true
  hasError.value = false

  try {
    const take = 10
    const skip = (page.value - 1) * take

    const res = await getProducts({
      categoryId: categories.value[currentCategory.value]?.id || undefined,
      merchantId: undefined,
      skip,
      take
    })

    const list = Array.isArray(res) ? (res[0] || []) : (res.list || res.items || [])
    const total = Array.isArray(res) ? Number(res[1] || 0) : Number(res.total || 0)

    if (page.value === 1) {
      products.value = list
    } else {
      products.value.push(...list)
    }

    noMore.value = list.length < take || (total > 0 && products.value.length >= total)
  } catch (error) {
    console.error('获取商品列表失败', error)
    if (page.value === 1) hasError.value = true
  } finally {
    loading.value = false
    refreshing.value = false
    isFirstLoad.value = false
  }
}

const switchCategory = (index) => {
  if (currentCategory.value === index) return
  currentCategory.value = index
  resetList()
  fetchProducts()
}

const switchSort = (value) => {
  if (value === 'price' && currentSort.value === 'price') {
    priceAsc.value = !priceAsc.value
  } else {
    currentSort.value = value
  }
  resetList()
  fetchProducts()
}

const resetList = () => {
  page.value = 1
  noMore.value = false
  isFirstLoad.value = true
}

const resetFilters = () => {
  currentCategory.value = 0
  currentSort.value = 'default'
  resetList()
  fetchProducts()
}

const loadMore = () => {
  if (noMore.value || loading.value) return
  page.value++
  fetchProducts()
}

const onRefresh = () => {
  refreshing.value = true
  resetList()
  fetchProducts()
}

const retryFetch = () => {
  isFirstLoad.value = true
  fetchProducts()
}

const goSearch = () => {
  uni.navigateTo({ url: '/pages/product/search' })
}

const goDetail = (product) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${product.id}` })
}

const goHome = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const addToCart = (product) => {
  cartStore.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    shopId: product.shopId,
    shopName: product.shopName
  })
  uni.showToast({ title: '已加入购物车', icon: 'success', duration: 1200 })
}
</script>

<style lang="scss" scoped>
.product-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

// ---- 吸顶头部 ----
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

// ---- 分类标签 ----
.category-tabs {
  white-space: nowrap;
  background-color: #fff;
  padding: 0 $spacing-sm;

  &__inner {
    display: inline-flex;
    padding: 12rpx 0 0;
  }
}

.category-tab {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20rpx 20rpx;
  font-size: $font-size-sm;
  color: $text-secondary;
  white-space: nowrap;
  transition: color 0.2s;

  &--active {
    color: $primary-color;
    font-weight: 600;
    font-size: $font-size-base;
  }

  &__line {
    position: absolute;
    bottom: 8rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 4rpx;
    background-color: $primary-color;
    border-radius: 4rpx;
  }
}

// ---- 排序条 ----
.sort-bar {
  display: flex;
  background-color: #fff;
  padding: 14rpx $spacing-base;
  border-top: 1rpx solid $border-light;
}

.sort-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  color: $text-secondary;
  gap: 6rpx;

  &--active {
    color: $primary-color;
    font-weight: 600;
  }

  .sort-arrows {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-left: 4rpx;

    .arrow-up,
    .arrow-down {
      font-size: 16rpx;
      line-height: 1;
      color: $text-placeholder;
      &.arrow--active {
        color: $primary-color;
      }
    }
  }
}

// ---- 商品列表 ----
.product-list {
  flex: 1;
  overflow: hidden;
  padding: $spacing-sm $spacing-base 0;
}

// ---- 骨架屏 ----
.skeleton-card {
  display: flex;
  background-color: #fff;
  border-radius: $radius-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;
  box-shadow: $elevation-card;

  .sk-img {
    width: 200rpx;
    height: 200rpx;
    border-radius: $radius-sm;
    @include skeleton-block;
    flex-shrink: 0;
  }

  .sk-info {
    flex: 1;
    margin-left: $spacing-base;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .sk-line {
    height: 28rpx;
    border-radius: $radius-sm;
    @include skeleton-block;

    &--long { width: 90%; }
    &--mid  { width: 60%; }
    &--short { width: 40%; }
  }
}

// ---- 列表底部 ----
.list-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg 0;
  gap: 12rpx;
}

.footer-text {
  font-size: $font-size-xs;
  color: $text-placeholder;
}

.no-more-line {
  flex: 1;
  max-width: 80rpx;
  height: 1rpx;
  background-color: $border-light;
}

// 加载中圆点动画
.loading-dots {
  display: flex;
  gap: 8rpx;

  .dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: $primary-light;
    animation: dot-bounce 1.2s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

// ---- 空态 ----
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx $spacing-base 80rpx;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $spacing-md;
    opacity: 0.45;
  }

  .empty-title {
    font-size: $font-size-md;
    color: $text-secondary;
    font-weight: 500;
    margin-bottom: $spacing-sm;
  }

  .empty-desc {
    font-size: $font-size-sm;
    color: $text-placeholder;
    margin-bottom: $spacing-xl;
  }

  .empty-actions {
    display: flex;
    gap: $spacing-base;
  }

  .btn-reset {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 40rpx;
    border-radius: $radius-round;
    font-size: $font-size-sm;
    border: 2rpx solid $border-color;
    color: $text-regular;
    background-color: #fff;

    &:active { background-color: $bg-gray; }
  }

  .btn-home {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 40rpx;
    border-radius: $radius-round;
    font-size: $font-size-sm;
    background-color: $primary-color;
    color: #fff;

    &:active { background-color: $primary-dark; }
  }
}

// ---- 错误态 ----
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx $spacing-base;

  .error-icon {
    font-size: 100rpx;
    margin-bottom: $spacing-md;
    opacity: 0.5;
  }

  .error-text {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: $spacing-lg;
  }

  .btn-retry {
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 60rpx;
    border-radius: $radius-round;
    background-color: $primary-color;
    color: #fff;
    font-size: $font-size-sm;

    &:active { background-color: $primary-dark; }
  }
}
</style>