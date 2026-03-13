<template>
  <view class="detail-page">
    <!-- 商品图片轮播 -->
    <swiper class="product-swiper" :indicator-dots="true" :autoplay="true" circular>
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image :src="img" mode="aspectFill" class="swiper-image" @click="previewImage(index)" />
      </swiper-item>
    </swiper>
    
    <!-- 商品信息 -->
    <view class="product-info">
      <view class="price-row">
        <text class="price">¥{{ product.price }}</text>
        <text v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</text>
        <view v-if="product.allianceDiscount" class="alliance-badge">
          <text>联盟价 ¥{{ product.alliancePrice }}</text>
        </view>
      </view>
      
      <text class="product-name">{{ product.name }}</text>
      <text class="product-desc">{{ product.description }}</text>
      
      <view class="meta-row">
        <text class="sales">已售{{ product.sales || 0 }}件</text>
        <text class="delivery">{{ product.deliveryInfo || '支持配送' }}</text>
      </view>
    </view>
    
    <!-- 规格选择 -->
    <view class="section" @click="showSpecModal = true" v-if="product.specs && product.specs.length">
      <view class="section-row">
        <text class="label">选择</text>
        <text class="value">{{ selectedSpecText || '请选择规格' }}</text>
        <text class="arrow">›</text>
      </view>
    </view>
    
    <!-- 商家信息 -->
    <view class="section shop-info" @click="goShop">
      <image class="shop-avatar" :src="product.shopAvatar || '/static/logo.png'" mode="aspectFill" />
      <view class="shop-detail">
        <text class="shop-name">{{ product.shopName }}</text>
        <text class="shop-address">{{ product.shopAddress }}</text>
      </view>
      <text class="arrow">›</text>
    </view>
    
    <!-- 商品评价 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">商品评价 ({{ product.reviewCount || 0 }})</text>
        <text class="section-more" @click="goReviews">查看全部 ›</text>
      </view>
      <view v-if="reviews.length > 0" class="review-list">
        <view class="review-item" v-for="review in reviews" :key="review.id">
          <view class="review-user">
            <image class="user-avatar" :src="review.avatar || '/static/images/default-avatar.png'" />
            <text class="user-name">{{ review.nickname }}</text>
            <text class="review-time">{{ review.createTime }}</text>
          </view>
          <text class="review-content">{{ review.content }}</text>
        </view>
      </view>
      <view v-else class="no-review">
        <text>暂无评价</text>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar safe-bottom">
      <view class="action-icons">
        <view class="action-item" @click="goShop">
          <text class="icon">🏪</text>
          <text class="text">店铺</text>
        </view>
        <view class="action-item" @click="toggleFav">
          <text class="icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
          <text class="text">收藏</text>
        </view>
      </view>
      <view class="action-buttons">
        <button class="btn-cart" @click="handleAddToCart">加入购物车</button>
        <button class="btn-buy" @click="handleBuyNow">立即购买</button>
      </view>
    </view>
    
    <!-- 规格选择弹窗 -->
    <view v-if="showSpecModal" class="spec-modal" @click="showSpecModal = false">
      <view class="spec-content" @click.stop>
        <view class="spec-header">
          <image class="spec-image" :src="product.images?.[0]" mode="aspectFill" />
          <view class="spec-info">
            <text class="spec-price">¥{{ selectedSpec?.price || product.price }}</text>
            <text class="spec-selected">已选：{{ selectedSpecText || '请选择' }}</text>
          </view>
          <view class="close" @click="showSpecModal = false">✕</view>
        </view>
        
        <scroll-view class="spec-body" scroll-y>
          <view class="spec-group" v-for="(group, gIdx) in product.specs" :key="gIdx">
            <text class="spec-group-title">{{ group.name }}</text>
            <view class="spec-options">
              <view 
                v-for="(opt, oIdx) in group.options" 
                :key="oIdx"
                class="spec-option"
                :class="{ active: selectedSpecs[gIdx] === oIdx }"
                @click="selectSpec(gIdx, oIdx)"
              >
                <text>{{ opt.name }}</text>
              </view>
            </view>
          </view>
          
          <view class="quantity-row">
            <text class="label">数量</text>
            <view class="quantity-control">
              <view class="btn-minus" @click="quantity > 1 && quantity--">-</view>
              <text class="quantity-num">{{ quantity }}</text>
              <view class="btn-plus" @click="quantity++">+</view>
            </view>
          </view>
        </scroll-view>
        
        <view class="spec-footer">
          <button class="btn-confirm" @click="confirmSpec">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductDetail, getProductReviews, toggleFavorite } from '@/api/product'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'

const cartStore = useCartStore()
const userStore = useUserStore()

const product = ref({
  id: '',
  name: '',
  price: 0,
  images: [],
  specs: [],
  shopName: '',
  shopId: ''
})
const reviews = ref([])
const showSpecModal = ref(false)
const selectedSpecs = ref({})
const quantity = ref(1)
const isFavorite = ref(false)

const selectedSpecText = computed(() => {
  if (!product.value.specs?.length) return ''
  return Object.entries(selectedSpecs.value)
    .map(([gIdx, oIdx]) => product.value.specs[gIdx]?.options[oIdx]?.name)
    .filter(Boolean)
    .join(', ')
})

const selectedSpec = computed(() => {
  // 查找匹配的SKU价格
  return null
})

onLoad(async (options) => {
  if (options.id) {
    await fetchProduct(options.id)
    fetchReviews(options.id)
  }
})

const fetchProduct = async (id) => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await getProductDetail(id)
    product.value = res
  } catch (error) {
    console.error('获取商品详情失败', error)
  } finally {
    uni.hideLoading()
  }
}

const fetchReviews = async (productId) => {
  try {
    const res = await getProductReviews(productId, { page: 1, pageSize: 3 })
    reviews.value = res.list || []
  } catch (error) {
    console.error('获取评价失败', error)
  }
}

const previewImage = (index) => {
  uni.previewImage({
    current: index,
    urls: product.value.images
  })
}

const selectSpec = (gIdx, oIdx) => {
  selectedSpecs.value[gIdx] = oIdx
}

const confirmSpec = () => {
  showSpecModal.value = false
}

const toggleFav = async () => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  try {
    await toggleFavorite(product.value.id)
    isFavorite.value = !isFavorite.value
    uni.showToast({ 
      title: isFavorite.value ? '收藏成功' : '取消收藏', 
      icon: 'success' 
    })
  } catch (error) {
    console.error('收藏操作失败', error)
  }
}

const handleAddToCart = () => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  
  if (product.value.specs?.length && !Object.keys(selectedSpecs.value).length) {
    showSpecModal.value = true
    return
  }
  
  cartStore.addItem({
    productId: product.value.id,
    name: product.value.name,
    image: product.value.images?.[0],
    price: selectedSpec.value?.price || product.value.price,
    specId: selectedSpecText.value,
    specText: selectedSpecText.value,
    shopId: product.value.shopId,
    shopName: product.value.shopName,
    quantity: quantity.value
  })
  
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

const handleBuyNow = () => {
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  
  if (product.value.specs?.length && !Object.keys(selectedSpecs.value).length) {
    showSpecModal.value = true
    return
  }
  
  // 立即购买，跳转到订单确认页
  const orderItem = {
    productId: product.value.id,
    name: product.value.name,
    image: product.value.images?.[0],
    price: selectedSpec.value?.price || product.value.price,
    specText: selectedSpecText.value,
    quantity: quantity.value,
    shopId: product.value.shopId,
    shopName: product.value.shopName
  }
  
  uni.navigateTo({
    url: `/pages/order/confirm?items=${encodeURIComponent(JSON.stringify([orderItem]))}`
  })
}

const goShop = () => {
  if (product.value.shopId) {
    uni.navigateTo({ url: `/pages/product/list?shopId=${product.value.shopId}` })
  }
}

const goReviews = () => {
  uni.navigateTo({ url: `/pages/product/reviews?productId=${product.value.id}` })
}
</script>

<style lang="scss" scoped>
.detail-page {
  padding-bottom: 120rpx;
}

.product-swiper {
  width: 100%;
  height: 750rpx;
  
  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

.product-info {
  @include card;
  margin-top: 0;
  
  .price-row {
    display: flex;
    align-items: baseline;
    margin-bottom: $spacing-sm;
    
    .price {
      font-size: 48rpx;
      font-weight: bold;
      color: $price-color;
    }
    
    .original-price {
      font-size: $font-size-sm;
      color: $text-secondary;
      text-decoration: line-through;
      margin-left: 16rpx;
    }
    
    .alliance-badge {
      margin-left: auto;
      @include tag($primary-color);
    }
  }
  
  .product-name {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-primary;
    line-height: 1.4;
    @include ellipsis(2);
  }
  
  .product-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-top: 8rpx;
    @include ellipsis(2);
  }
  
  .meta-row {
    @include flex-between;
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.section {
  @include card;
  
  .section-row {
    @include flex-between;
    
    .label {
      font-size: $font-size-base;
      color: $text-secondary;
      margin-right: $spacing-base;
    }
    
    .value {
      flex: 1;
      font-size: $font-size-base;
      color: $text-primary;
    }
    
    .arrow {
      font-size: $font-size-lg;
      color: $text-secondary;
    }
  }
  
  .section-header {
    @include flex-between;
    margin-bottom: $spacing-base;
    
    .section-title {
      font-size: $font-size-md;
      font-weight: bold;
    }
    
    .section-more {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.shop-info {
  display: flex;
  align-items: center;
  
  .shop-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 8rpx;
    margin-right: $spacing-base;
  }
  
  .shop-detail {
    flex: 1;
    
    .shop-name {
      font-size: $font-size-md;
      font-weight: bold;
    }
    
    .shop-address {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-top: 4rpx;
    }
  }
}

.review-item {
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
  
  .review-user {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
    
    .user-avatar {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      margin-right: 12rpx;
    }
    
    .user-name {
      font-size: $font-size-sm;
      color: $text-primary;
    }
    
    .review-time {
      margin-left: auto;
      font-size: $font-size-xs;
      color: $text-secondary;
    }
  }
  
  .review-content {
    font-size: $font-size-base;
    color: $text-regular;
    line-height: 1.5;
  }
}

.no-review {
  text-align: center;
  padding: $spacing-lg 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  height: 100rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding: 0 $spacing-base;
  z-index: 100;
  
  .action-icons {
    display: flex;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 32rpx;
      
      .icon { font-size: 36rpx; }
      .text { font-size: 20rpx; color: $text-secondary; }
    }
  }
  
  .action-buttons {
    flex: 1;
    display: flex;
    
    .btn-cart, .btn-buy {
      flex: 1;
      height: 72rpx;
      line-height: 72rpx;
      text-align: center;
      font-size: $font-size-base;
      color: #fff;
      border: none;
      padding: 0;
      margin: 0;
      
      &::after { border: none; }
    }
    
    .btn-cart {
      background-color: $secondary-color;
      border-radius: 36rpx 0 0 36rpx;
    }
    
    .btn-buy {
      background-color: $primary-color;
      border-radius: 0 36rpx 36rpx 0;
    }
  }
}

// 规格弹窗
.spec-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  
  .spec-content {
    width: 100%;
    max-height: 80vh;
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    flex-direction: column;
  }
  
  .spec-header {
    display: flex;
    padding: $spacing-base;
    border-bottom: 1rpx solid $border-light;
    
    .spec-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: $radius-sm;
    }
    
    .spec-info {
      flex: 1;
      margin-left: $spacing-base;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      
      .spec-price {
        font-size: 40rpx;
        font-weight: bold;
        color: $price-color;
      }
      
      .spec-selected {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: 8rpx;
      }
    }
    
    .close {
      font-size: 36rpx;
      color: $text-secondary;
      padding: 8rpx;
    }
  }
  
  .spec-body {
    flex: 1;
    padding: $spacing-base;
    max-height: 500rpx;
    
    .spec-group {
      margin-bottom: $spacing-base;
      
      &-title {
        font-size: $font-size-base;
        font-weight: bold;
        margin-bottom: $spacing-sm;
      }
    }
    
    .spec-options {
      display: flex;
      flex-wrap: wrap;
      
      .spec-option {
        padding: 12rpx 28rpx;
        border: 1rpx solid $border-color;
        border-radius: $radius-round;
        margin-right: $spacing-sm;
        margin-bottom: $spacing-sm;
        font-size: $font-size-sm;
        
        &.active {
          border-color: $primary-color;
          color: $primary-color;
          background-color: rgba($primary-color, 0.1);
        }
      }
    }
    
    .quantity-row {
      @include flex-between;
      margin-top: $spacing-base;
      
      .quantity-control {
        display: flex;
        align-items: center;
        
        .btn-minus, .btn-plus {
          width: 52rpx;
          height: 52rpx;
          @include flex-center;
          border: 1rpx solid $border-color;
          border-radius: 8rpx;
          font-size: $font-size-lg;
        }
        
        .quantity-num {
          width: 80rpx;
          text-align: center;
          font-size: $font-size-md;
        }
      }
    }
  }
  
  .spec-footer {
    padding: $spacing-base;
    @include safe-bottom;
    
    .btn-confirm {
      @include btn-primary;
      width: 100%;
    }
  }
}
</style>