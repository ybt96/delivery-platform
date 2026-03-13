<template>
  <view class="cart-page">
    <!-- 有商品态 -->
    <template v-if="cartItems.length > 0">
      <!-- 顶部编辑栏 -->
      <view class="cart-top-bar">
        <text class="cart-title">购物车</text>
        <text class="edit-btn" @click="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</text>
      </view>

      <!-- 购物车列表 -->
      <scroll-view class="cart-list" scroll-y>
        <view
          v-for="(group, shopId) in cartGrouped"
          :key="shopId"
          class="shop-group"
        >
          <!-- 店铺头部 -->
          <view class="shop-header">
            <view
              class="checkbox"
              :class="{ 'checkbox--checked': group.selected }"
              @click="toggleShopSelect(shopId)"
            >
              <text v-if="group.selected" class="checkbox__icon">✓</text>
            </view>
            <text class="shop-icon">🏪</text>
            <text class="shop-name">{{ group.shopName || '平台直营' }}</text>
            <text class="shop-arrow">›</text>
          </view>

          <!-- 商品列表 -->
          <view
            v-for="item in group.items"
            :key="item.id"
            class="cart-item"
          >
            <view
              class="checkbox"
              :class="{ 'checkbox--checked': item.selected }"
              @click="toggleSelect(item.originalIndex)"
            ></view>

            <image
              class="item-image"
              :src="item.image || '/static/images/default-img.png'"
              mode="aspectFill"
              @click="goProduct(item)"
            />

            <view class="item-body" @click="goProduct(item)">
              <text class="item-name">{{ item.name }}</text>
              <text v-if="item.specText" class="item-spec">{{ item.specText }}</text>
              <view class="item-bottom">
                <view class="item-price-box">
                  <text class="price-sym">¥</text>
                  <text class="price-val">{{ item.price }}</text>
                </view>
                <view v-if="!isEditing" class="qty-control" @click.stop>
                  <view
                    class="qty-btn qty-btn--minus"
                    :class="{ 'qty-btn--disabled': item.quantity <= 1 }"
                    @click="updateQuantity(item.originalIndex, item.quantity - 1)"
                  >
                    <text>−</text>
                  </view>
                  <input
                    class="qty-input"
                    type="number"
                    :value="item.quantity"
                    @blur="(e) => onQuantityInput(e, item.originalIndex)"
                  />
                  <view
                    class="qty-btn qty-btn--plus"
                    @click="updateQuantity(item.originalIndex, item.quantity + 1)"
                  >
                    <text>+</text>
                  </view>
                </view>
                <!-- 编辑模式：显示删除按钮 -->
                <view
                  v-else
                  class="item-delete"
                  @click.stop="removeItem(item.originalIndex)"
                >
                  <text>删除</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部留白（避免被结算栏遮住） -->
        <view class="list-bottom-safe"></view>
      </scroll-view>

      <!-- 底部结算栏 -->
      <view class="checkout-bar safe-bottom">
        <view class="select-all-area" @click="toggleSelectAll">
          <view class="checkbox" :class="{ 'checkbox--checked': isAllSelected }">
            <text v-if="isAllSelected" class="checkbox__icon">✓</text>
          </view>
          <text class="select-all-text">全选</text>
        </view>

        <view v-if="!isEditing" class="checkout-info">
          <view class="total-wrap">
            <text class="total-label">合计</text>
            <text class="total-sym">¥</text>
            <text class="total-val">{{ selectedAmountInt }}</text>
            <text class="total-dec">.{{ selectedAmountDec }}</text>
          </view>
          <text v-if="savedAmount > 0" class="saved-tip">已省 ¥{{ savedAmount }}</text>
        </view>

        <view v-if="isEditing" class="delete-selected-wrap">
          <view
            class="btn-delete-selected"
            :class="{ 'btn-delete-selected--disabled': selectedCount === 0 }"
            @click="deleteSelected"
          >
            删除({{ selectedCount }})
          </view>
        </view>
        <view v-else>
          <view
            class="btn-checkout"
            :class="{ 'btn-checkout--disabled': selectedCount === 0 }"
            @click="submitOrder"
          >
            结算{{ selectedCount > 0 ? `(${selectedCount})` : '' }}
          </view>
        </view>
      </view>
    </template>

    <!-- 空购物车 -->
    <view v-else class="cart-empty">
      <view class="empty-cart-icon">🛒</view>
      <text class="empty-title">购物车是空的</text>
      <text class="empty-desc">去挑选心仪的商品吧</text>
      <view class="btn-go-shop" @click="goShop">去逛逛</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/store/modules/cart'
import { useUserStore } from '@/store/modules/user'

const cartStore = useCartStore()
const userStore = useUserStore()

const { items: cartItems, isAllSelected, selectedAmount, selectedCount, selectedItems } = storeToRefs(cartStore)

const isEditing = ref(false)

// 按店铺分组
const cartGrouped = computed(() => {
  const groups = {}
  cartItems.value.forEach((item, index) => {
    const shopId = item.shopId || 'platform'
    if (!groups[shopId]) {
      groups[shopId] = {
        shopName: item.shopName,
        items: [],
        selected: true
      }
    }
    groups[shopId].items.push({ ...item, originalIndex: index })
    if (!item.selected) groups[shopId].selected = false
  })
  return groups
})

// 总价分拆整数 + 小数
const selectedAmountInt = computed(() => {
  return Math.floor(selectedAmount.value).toString()
})
const selectedAmountDec = computed(() => {
  return (selectedAmount.value % 1).toFixed(2).slice(2)
})

// 省了多少（原价 - 现价，简单模拟）
const savedAmount = computed(() => 0)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const toggleSelect = (index) => {
  cartStore.toggleSelect(index)
}

const toggleShopSelect = (shopId) => {
  const group = cartGrouped.value[shopId]
  const targetSelect = !group.selected
  group.items.forEach((item) => {
    if (cartItems.value[item.originalIndex].selected !== targetSelect) {
      cartStore.toggleSelect(item.originalIndex)
    }
  })
}

const toggleSelectAll = () => {
  cartStore.toggleSelectAll()
}

const updateQuantity = (index, qty) => {
  if (qty < 1) return
  cartStore.updateQuantity(index, qty)
}

const onQuantityInput = (e, index) => {
  const val = parseInt(e.detail.value)
  if (isNaN(val) || val < 1) {
    cartStore.updateQuantity(index, cartItems.value[index].quantity)
  } else {
    cartStore.updateQuantity(index, val)
  }
}

const removeItem = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) cartStore.removeItem(index)
    }
  })
}

const deleteSelected = () => {
  if (selectedCount.value === 0) return
  uni.showModal({
    title: '提示',
    content: `确定删除选中的 ${selectedCount.value} 件商品吗？`,
    success: (res) => {
      if (res.confirm) {
        // 从后往前删除，避免索引偏移
        const toDelete = cartItems.value
          .map((item, index) => ({ ...item, index }))
          .filter(item => item.selected)
          .map(item => item.index)
          .reverse()
        toDelete.forEach(i => cartStore.removeItem(i))
        isEditing.value = false
      }
    }
  })
}

const submitOrder = () => {
  if (selectedCount.value === 0) return
  if (!userStore.isLoggedIn) {
    return uni.navigateTo({ url: '/pages/auth/login' })
  }
  const items = JSON.stringify(selectedItems.value)
  uni.navigateTo({
    url: `/pages/order/confirm?items=${encodeURIComponent(items)}`
  })
}

const goProduct = (item) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${item.productId}` })
}

const goShop = () => {
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
.cart-page {
  height: 100vh;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

// ---- 顶部标题栏 ----
.cart-top-bar {
  height: $nav-height;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-base;
  border-bottom: 1rpx solid $border-light;

  .cart-title {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $text-primary;
  }

  .edit-btn {
    font-size: $font-size-base;
    color: $primary-color;
    padding: 12rpx 0 12rpx $spacing-base;
  }
}

// ---- 购物车列表 ----
.cart-list {
  flex: 1;
  padding: $spacing-sm $spacing-base;
  overflow: hidden;
}

.list-bottom-safe {
  height: 140rpx;
}

// ---- 通用复选框 ----
.checkbox {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid $border-color;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: $spacing-sm;
  flex-shrink: 0;
  background-color: #fff;
  transition: all 0.2s;

  &--checked {
    background-color: $primary-color;
    border-color: $primary-color;
  }

  &__icon {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
  }
}

// ---- 店铺分组 ----
.shop-group {
  background-color: #fff;
  border-radius: $radius-base;
  margin-bottom: $spacing-sm;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.shop-header {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-base;
  border-bottom: 1rpx solid $border-light;
  background-color: #fafafa;

  .shop-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }

  .shop-name {
    flex: 1;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }

  .shop-arrow {
    font-size: 28rpx;
    color: $text-placeholder;
  }
}

// ---- 购物车商品行 ----
.cart-item {
  display: flex;
  align-items: center;
  padding: $spacing-base;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-sm;
  background-color: $bg-gray;
  flex-shrink: 0;
  margin-right: $spacing-sm;
}

.item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160rpx;
}

.item-name {
  font-size: $font-size-base;
  color: $text-primary;
  line-height: 1.4;
  @include ellipsis(2);
}

.item-spec {
  font-size: $font-size-xs;
  color: $text-secondary;
  background-color: $bg-gray;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
  display: inline-block;
  align-self: flex-start;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price-box {
  display: flex;
  align-items: baseline;

  .price-sym {
    font-size: $font-size-sm;
    color: $price-color;
    font-weight: bold;
  }

  .price-val {
    font-size: $font-size-lg;
    color: $price-color;
    font-weight: bold;
    margin-left: 2rpx;
  }
}

// ---- 数量控制 ----
.qty-control {
  display: flex;
  align-items: center;
  border: 1rpx solid $border-color;
  border-radius: $radius-sm;
  overflow: hidden;
}

.qty-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $bg-gray;

  text {
    font-size: 32rpx;
    color: $text-primary;
    line-height: 1;
  }

  &--minus text, &--plus text {
    font-weight: 300;
  }

  &--disabled text {
    color: $text-placeholder;
  }

  &:active:not(.qty-btn--disabled) {
    background-color: $border-color;
  }
}

.qty-input {
  width: 68rpx;
  height: 52rpx;
  text-align: center;
  font-size: $font-size-sm;
  color: $text-primary;
  background-color: #fff;
  border-left: 1rpx solid $border-color;
  border-right: 1rpx solid $border-color;
}

// ---- 编辑删除按钮 ----
.item-delete {
  height: 52rpx;
  line-height: 52rpx;
  padding: 0 24rpx;
  border-radius: $radius-sm;
  border: 1rpx solid $error-color;

  text {
    font-size: $font-size-xs;
    color: $error-color;
  }

  &:active { opacity: 0.7; }
}

// ---- 底部结算栏 ----
.checkout-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 108rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 $spacing-base;
  box-shadow: $elevation-bar;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.select-all-area {
  display: flex;
  align-items: center;

  .select-all-text {
    font-size: $font-size-sm;
    color: $text-regular;
  }
}

.checkout-info {
  flex: 1;
  padding: 0 $spacing-base;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-wrap {
  display: flex;
  align-items: baseline;

  .total-label {
    font-size: $font-size-sm;
    color: $text-regular;
    margin-right: 8rpx;
  }

  .total-sym {
    font-size: $font-size-sm;
    color: $price-color;
    font-weight: bold;
  }

  .total-val {
    font-size: $font-size-xxl;
    color: $price-color;
    font-weight: bold;
    line-height: 1;
  }

  .total-dec {
    font-size: $font-size-sm;
    color: $price-color;
    font-weight: bold;
    align-self: flex-end;
    margin-bottom: 4rpx;
  }
}

.saved-tip {
  font-size: $font-size-xs;
  color: $secondary-color;
  margin-top: 4rpx;
}

// 结算按钮
.btn-checkout {
  min-width: 220rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: $radius-round;
  background-color: $primary-color;
  color: #fff;
  font-size: $font-size-base;
  font-weight: 600;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);

  &--disabled {
    background-color: $text-placeholder;
    box-shadow: none;
  }

  &:active:not(.btn-checkout--disabled) {
    background-color: $primary-dark;
  }
}

// 删除选中按钮
.delete-selected-wrap {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.btn-delete-selected {
  min-width: 220rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: $radius-round;
  border: 2rpx solid $error-color;
  color: $error-color;
  font-size: $font-size-base;

  &--disabled {
    border-color: $border-color;
    color: $text-placeholder;
  }

  &:active:not(.btn-delete-selected--disabled) {
    background-color: rgba($error-color, 0.05);
  }
}

// ---- 空购物车 ----
.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 $spacing-base;

  .empty-cart-icon {
    font-size: 160rpx;
    margin-bottom: $spacing-lg;
    opacity: 0.35;
  }

  .empty-title {
    font-size: $font-size-lg;
    color: $text-secondary;
    font-weight: 500;
    margin-bottom: $spacing-sm;
  }

  .empty-desc {
    font-size: $font-size-sm;
    color: $text-placeholder;
    margin-bottom: $spacing-xl;
  }

  .btn-go-shop {
    width: 280rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: $radius-round;
    background-color: $primary-color;
    color: #fff;
    font-size: $font-size-base;
    font-weight: 600;
    box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);

    &:active { background-color: $primary-dark; }
  }
}
</style>