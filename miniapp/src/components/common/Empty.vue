<template>
  <view class="empty-container">
    <image
      class="empty-container__image"
      :src="image || '/static/images/empty.png'"
      mode="aspectFit"
    />
    <text class="empty-container__text">{{ text || '暂无数据' }}</text>
    <view v-if="showButton" class="empty-container__button" @click="handleClick">
      <text class="empty-container__button-text">{{ buttonText }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  image: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: '暂无数据'
  },
  showButton: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: '去看看'
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  &__image {
    width: 320rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }

  &__text {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: 40rpx;
  }

  &__button {
    padding: 16rpx 60rpx;
    border-radius: $radius-round;
    background-color: $primary-color;

    &-text {
      font-size: $font-size-base;
      color: #fff;
    }
  }
}
</style>