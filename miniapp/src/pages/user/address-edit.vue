<template>
  <view class="address-edit-page">
    <view class="form-section">
      <!-- 联系人 -->
      <view class="form-item">
        <text class="label">联系人</text>
        <input class="input" v-model="form.name" placeholder="请输入收货人姓名" />
      </view>
      
      <!-- 手机号 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="form.phone" type="number" maxlength="11" placeholder="请输入联系电话" />
      </view>
      
      <!-- 所在地区 -->
      <view class="form-item" @click="showRegionPicker = true">
        <text class="label">所在地区</text>
        <text class="input" :class="{ placeholder: !regionText }">
          {{ regionText || '请选择省/市/区' }}
        </text>
        <text class="arrow">›</text>
      </view>
      
      <!-- 详细地址 -->
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea class="textarea" v-model="form.detail" placeholder="街道、楼牌号等详细信息" maxlength="200" />
      </view>
      
      <!-- 地址标签 -->
      <view class="form-item">
        <text class="label">标签</text>
        <view class="tag-list">
          <view 
            class="tag" 
            :class="{ active: form.tag === tag }" 
            v-for="tag in tagOptions" 
            :key="tag"
            @click="form.tag = form.tag === tag ? '' : tag"
          >
            {{ tag }}
          </view>
        </view>
      </view>
      
      <!-- 设为默认地址 -->
      <view class="form-item">
        <text class="label">设为默认地址</text>
        <switch :checked="form.isDefault" color="#4CAF50" @change="form.isDefault = $event.detail.value" />
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="btn-section">
      <button class="btn-save" @click="handleSave">保存地址</button>
      <button class="btn-delete" v-if="isEdit" @click="handleDelete">删除地址</button>
    </view>
    
    <!-- 地区选择器 (使用 picker 组件) -->
    <picker 
      v-if="showRegionPicker"
      mode="region" 
      @change="onRegionChange" 
      @cancel="showRegionPicker = false"
      :value="[form.province, form.city, form.district]"
    >
      <view></view>
    </picker>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { validatePhone } from '@/utils/validate'

const userStore = useUserStore()

const isEdit = ref(false)
const addressId = ref('')
const showRegionPicker = ref(false)

const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  tag: '',
  isDefault: false
})

const tagOptions = ['家', '公司', '学校', '其他']

const regionText = computed(() => {
  if (form.value.province && form.value.city && form.value.district) {
    return `${form.value.province} ${form.value.city} ${form.value.district}`
  }
  return ''
})

onLoad((options) => {
  if (options.id) {
    isEdit.value = true
    addressId.value = options.id
    
    // 从 store 中获取地址数据
    const addr = userStore.addresses.find(a => a.id === options.id)
    if (addr) {
      form.value = { ...addr }
    }
  }
  
  // 页面加载时触发地区选择器
  // showRegionPicker 需要手动点击触发
})

const onRegionChange = (e) => {
  const [province, city, district] = e.detail.value
  form.value.province = province
  form.value.city = city
  form.value.district = district
  showRegionPicker.value = false
}

const handleSave = () => {
  // 表单验证
  if (!form.value.name.trim()) {
    return uni.showToast({ title: '请输入联系人姓名', icon: 'none' })
  }
  if (!validatePhone(form.value.phone)) {
    return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  }
  if (!form.value.province || !form.value.city || !form.value.district) {
    return uni.showToast({ title: '请选择所在地区', icon: 'none' })
  }
  if (!form.value.detail.trim()) {
    return uni.showToast({ title: '请输入详细地址', icon: 'none' })
  }
  
  if (isEdit.value) {
    userStore.updateAddress({ ...form.value, id: addressId.value })
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    const newAddress = {
      ...form.value,
      id: Date.now().toString()
    }
    userStore.addAddress(newAddress)
    uni.showToast({ title: '添加成功', icon: 'success' })
  }
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}

const handleDelete = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.removeAddress(addressId.value)
        uni.showToast({ title: '删除成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.address-edit-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 200rpx;
}

.form-section {
  background-color: #fff;
  margin: $spacing-sm;
  border-radius: $radius-base;
  
  .form-item {
    display: flex;
    align-items: center;
    padding: $spacing-md $spacing-base;
    border-bottom: 1rpx solid $border-light;
    
    &:last-child { border-bottom: none; }
    
    .label {
      width: 160rpx;
      font-size: $font-size-base;
      color: $text-primary;
      flex-shrink: 0;
    }
    
    .input {
      flex: 1;
      font-size: $font-size-base;
      color: $text-primary;
      
      &.placeholder {
        color: $text-placeholder;
      }
    }
    
    .textarea {
      flex: 1;
      font-size: $font-size-base;
      color: $text-primary;
      min-height: 120rpx;
    }
    
    .arrow {
      color: $text-secondary;
      font-size: 32rpx;
    }
    
    .tag-list {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      
      .tag {
        padding: 8rpx 28rpx;
        border: 1rpx solid $border-color;
        border-radius: $radius-round;
        margin-right: $spacing-sm;
        font-size: $font-size-sm;
        color: $text-regular;
        
        &.active {
          border-color: $primary-color;
          color: $primary-color;
          background-color: rgba(76, 175, 80, 0.08);
        }
      }
    }
  }
}

.btn-section {
  padding: $spacing-lg $spacing-base;
  
  .btn-save {
    @include btn-primary;
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    margin-bottom: $spacing-base;
    
    &::after { border: none; }
  }
  
  .btn-delete {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: transparent;
    color: $error-color;
    font-size: $font-size-base;
    border-radius: $radius-round;
    border: 1rpx solid $error-color;
    
    &::after { border: none; }
  }
}
</style>