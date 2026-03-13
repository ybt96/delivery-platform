<template>
  <view class="product-card" @click="handleClick">
    <!-- 商品图片 -->
    <view class="product-card__img-wrap">
      <image
        class="product-card__image"
        :src="product.image || defaultImage"
        mode="aspectFill"
        lazy-load
      />
      <!-- 标签层（叠在图片上角） -->
      <view v-if="product.allianceInfo && product.allianceInfo.isAlliance" class="product-card__img-badge">
        <text class="img-badge__text">联盟</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-card__info">
      <!-- 商品名称 -->
      <text class="product-card__name">{{ product.name }}</text>

      <!-- 标签行 -->
      <view v-if="hasTags" class="product-card__tags">
        <text
          v-if="product.allianceInfo && product.allianceInfo.discount"
          class="tag tag--discount"
        >{{ product.allianceInfo.discount }}折</text>
        <text v-if="product.isNew" class="tag tag--new">新品</text>
        <text v-if="product.deliveryFree" class="tag tag--free">免邮</text>
      </view>

      <!-- 价格 + 销量行 -->
      <view class="product-card__price-row">
        <view class="product-card__price-box">
          <text class="price-symbol">¥</text>
          <text class="price-main">{{ priceMain }}</text>
          <text class="price-decimal">.{{ priceDecimal }}</text>
          <text v-if="product.originalPrice" class="price-origin">¥{{ product.originalPrice }}</text>
        </view>
        <text class="product-card__sales">{{ formatSales(product.sales) }}</text>
      </view>

      <!-- 店铺 + 距离行 -->
      <view class="product-card__shop-row">
        <view class="shop-dot"></view>
        <text class="shop-name">{{ product.shopName || '平台直营' }}</text>
        <text v-if="product.distance" class="shop-distance">{{ formatDistance(product.distance) }}</text>
      </view>
    </view>

    <!-- 加购按钮 -->
    <view
      v-if="showCart"
      class="product-card__cart-btn"
      @click.stop="handleAddToCart"
    >
      <text class="cart-btn__icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import config from '@/common/config'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({})
  },
  showCart: {
    type: Boolean,
    default: false
  }
})

const defaultImage = config.DEFAULT_PRODUCT_IMAGE

const emit = defineEmits(['click', 'add-cart'])

// 价格分拆：整数部分 + 小数部分
const priceMain = computed(() => {
  const p = parseFloat(props.product.price || 0)
  return Math.floor(p).toString()
})
const priceDecimal = computed(() => {
  const p = parseFloat(props.product.price || 0)
  return (p % 1).toFixed(2).slice(2)
})

// 是否有标签
const hasTags = computed(() => {
  return (
    (props.product.allianceInfo && props.product.allianceInfo.discount) ||
    props.product.isNew ||
    props.product.deliveryFree
  )
})

const handleClick = () => {
  emit('click', props.product)
}

const handleAddToCart = () => {
  emit('add-cart', props.product)
}

const formatDistance = (distance) => {
  if (!distance) return ''
  if (distance < 1000) return `${distance}m`
  return `${(distance / 1000).toFixed(1)}km`
}

const formatSales = (sales) => {
  if (!sales) return '0件'
  if (sales >= 10000) return `${(sales / 10000).toFixed(1)}万件`
  return `${sales}件`
}
</script>

<style lang="scss" scoped>
.product-card {
  display: flex;
  background-color: #fff;
  border-radius: $radius-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;
  position: relative;
  box-shadow: $shadow-sm;

  // 按压反馈
  &:active {
    opacity: 0.94;
    transform: scale(0.99);
  }

  // ---- 图片区 ----
  &__img-wrap {
    position: relative;
    flex-shrink: 0;
    width: 200rpx;
    height: 200rpx;
    border-radius: $radius-sm;
    overflow: hidden;
    background-color: $bg-gray;
  }

  &__image {
    width: 100%;
    height: 100%;
  }

  &__img-badge {
    position: absolute;
    top: 0;
    left: 0;
    background-color: $primary-color;
    padding: 4rpx 10rpx;
    border-radius: 0 0 $radius-sm 0;

    .img-badge__text {
      font-size: 18rpx;
      color: #fff;
      font-weight: bold;
      letter-spacing: 1rpx;
    }
  }

  // ---- 信息区 ----
  &__info {
    flex: 1;
    margin-left: $spacing-base;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; // 防止撑破
  }

  &__name {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: 500;
    line-height: 1.45;
    @include ellipsis(2);
  }

  // ---- 标签行 ----
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 8rpx;
  }

  .tag {
    font-size: 18rpx;
    padding: 3rpx 10rpx;
    border-radius: $radius-sm;
    font-weight: 500;

    &--discount {
      color: $tag-danger-color;
      background-color: $tag-danger-bg;
    }
    &--new {
      color: $tag-primary-color;
      background-color: $tag-primary-bg;
    }
    &--free {
      color: $tag-warning-color;
      background-color: $tag-warning-bg;
    }
  }

  // ---- 价格行 ----
  &__price-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
  }

  &__price-box {
    display: flex;
    align-items: baseline;
    line-height: 1;

    .price-symbol {
      font-size: $font-size-sm;
      color: $price-color;
      font-weight: bold;
      margin-right: 2rpx;
    }

    .price-main {
      font-size: $font-size-xl;
      color: $price-color;
      font-weight: bold;
    }

    .price-decimal {
      font-size: $font-size-sm;
      color: $price-color;
      font-weight: bold;
      margin-left: 1rpx;
    }

    .price-origin {
      font-size: $font-size-xs;
      color: $text-placeholder;
      text-decoration: line-through;
      margin-left: 10rpx;
    }
  }

  &__sales {
    font-size: $font-size-xs;
    color: $text-placeholder;
  }

  // ---- 店铺行 ----
  &__shop-row {
    display: flex;
    align-items: center;
    margin-top: 8rpx;

    .shop-dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      background-color: $primary-light;
      margin-right: 8rpx;
      flex-shrink: 0;
    }

    .shop-name {
      font-size: $font-size-xs;
      color: $text-secondary;
      @include ellipsis(1);
      flex: 1;
    }

    .shop-distance {
      font-size: $font-size-xs;
      color: $text-placeholder;
      margin-left: 12rpx;
      white-space: nowrap;
      flex-shrink: 0;
    }
  }

  // ---- 加购按钮 ----
  &__cart-btn {
    position: absolute;
    right: $spacing-base;
    bottom: $spacing-base;
    width: 52rpx;
    height: 52rpx;
    background-color: $primary-color;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.35);

    &:active {
      background-color: $primary-dark;
      transform: scale(0.93);
    }

    .cart-btn__icon {
      color: #fff;
      font-size: 40rpx;
      font-weight: 300;
      line-height: 1;
      margin-top: -2rpx;
    }
  }
}
</style>