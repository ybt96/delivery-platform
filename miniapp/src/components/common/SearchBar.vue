<template>
  <view class="search-bar" :class="{ 'search-bar--fixed': fixed }">
    <view class="search-bar__inner">
      <text class="search-bar__icon">🔍</text>
      <input
        v-if="!disabled"
        class="search-bar__input"
        type="text"
        :value="modelValue"
        :placeholder="placeholder"
        :focus="focus"
        confirm-type="search"
        @input="handleInput"
        @confirm="handleSearch"
      />
      <view v-else class="search-bar__input search-bar__input--disabled" @click="handleClick">
        <text class="search-bar__placeholder">{{ placeholder }}</text>
      </view>
      <view v-if="modelValue" class="search-bar__clear" @click="handleClear">
        <text>✕</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索商品'
  },
  focus: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fixed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'click', 'clear'])

const handleInput = (e) => {
  emit('update:modelValue', e.detail.value)
}

const handleSearch = () => {
  emit('search', props.modelValue)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.search-bar {
  padding: $spacing-sm $spacing-base;
  background-color: #fff;
  
  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
  
  &__inner {
    display: flex;
    align-items: center;
    height: 72rpx;
    background-color: $bg-gray;
    border-radius: $radius-round;
    padding: 0 $spacing-base;
  }
  
  &__icon {
    font-size: $font-size-md;
    color: $text-placeholder;
    margin-right: $spacing-sm;
  }
  
  &__input {
    flex: 1;
    font-size: $font-size-base;
    color: $text-primary;
    
    &--disabled {
      display: flex;
      align-items: center;
    }
  }
  
  &__placeholder {
    font-size: $font-size-base;
    color: $text-placeholder;
  }
  
  &__clear {
    padding: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-secondary;
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style>