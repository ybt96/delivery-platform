<template>
  <view class="profile-page">
    <view class="section">
      <!-- 头像 -->
      <view class="item avatar-item" @click="changeAvatar">
        <text class="label">头像</text>
        <view class="content">
          <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
          <text class="arrow">›</text>
        </view>
      </view>
      
      <!-- 昵称 -->
      <view class="item" @click="editNickname">
        <text class="label">昵称</text>
        <view class="content">
          <text class="value">{{ userInfo.nickname || '未设置' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <!-- 手机号 -->
      <view class="item">
        <text class="label">手机号</text>
        <view class="content">
          <text class="value">{{ formatPhone(userInfo.phone) || '未绑定' }}</text>
          <button class="btn-bind" v-if="!userInfo.phone" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">绑定</button>
        </view>
      </view>
    </view>
    
    <view class="section">
      <!-- 实名认证 -->
      <view class="item" @click="goCertify">
        <text class="label">实名认证</text>
        <view class="content">
          <text class="value" :class="{ certified: userInfo.isCertified }">
            {{ userInfo.isCertified ? '已认证' : '未认证' }}
          </text>
          <text class="arrow" v-if="!userInfo.isCertified">›</text>
        </view>
      </view>
    </view>

    <!-- 昵称修改弹窗 -->
    <view class="modal-mask" v-if="showNameModal">
      <view class="modal-content">
        <text class="modal-title">修改昵称</text>
        <input 
          class="modal-input" 
          v-model="tempName" 
          placeholder="请输入新昵称" 
          maxlength="10"
          :focus="true"
        />
        <view class="modal-btns">
          <text class="btn-cancel" @click="showNameModal = false">取消</text>
          <text class="btn-confirm" @click="saveNickname">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { updateUserInfo } from '@/api/auth'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const showNameModal = ref(false)
const tempName = ref('')

const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 修改头像
const changeAvatar = () => {
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFiles[0].tempFilePath
      // 实际项目中这里需要先上传到服务器
      // uni.uploadFile(...)
      
      // 模拟更新
      updateUser({ avatar: tempFilePath })
    }
  })
}

// 修改昵称
const editNickname = () => {
  tempName.value = userInfo.value.nickname || ''
  showNameModal.value = true
}

const saveNickname = () => {
  if (!tempName.value.trim()) {
    return uni.showToast({ title: '昵称不能为空', icon: 'none' })
  }
  
  updateUser({ nickname: tempName.value.trim() })
  showNameModal.value = false
}

// 绑定手机号 (微信小程序特有)
const onGetPhoneNumber = (e) => {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    // 实际项目中需要将 code 发送给后端解密
    // const code = e.detail.code
    
    // 模拟更新
    updateUser({ phone: '13888888888' })
    uni.showToast({ title: '绑定成功', icon: 'success' })
  } else {
    uni.showToast({ title: '取消绑定', icon: 'none' })
  }
}

// 去实名认证
const goCertify = () => {
  if (userInfo.value.isCertified) return
  uni.showToast({ title: '功能开发中', icon: 'none' })
  // uni.navigateTo({ url: '/pages/user/certification' })
}

// 统一更新用户信息
const updateUser = async (data) => {
  try {
    uni.showLoading({ title: '保存中' })
    // 调用接口更新
    // await updateUserInfo(data)
    
    // 更新本地 state
    userStore.setUserInfo(data)
    uni.showToast({ title: '更新成功', icon: 'success' })
  } catch (error) {
    console.error('更新用户信息失败', error)
    uni.showToast({ title: '更新失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-top: $spacing-sm;
}

.section {
  background-color: #fff;
  margin-bottom: $spacing-sm;
  
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-base;
    border-bottom: 1rpx solid $border-light;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.avatar-item {
      padding: $spacing-sm $spacing-base;
    }
    
    .label {
      font-size: $font-size-base;
      color: $text-primary;
    }
    
    .content {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background-color: $bg-gray;
      }
      
      .value {
        font-size: $font-size-base;
        color: $text-secondary;
        
        &.certified {
          color: $success-color;
        }
      }
      
      .arrow {
        font-size: 32rpx;
        color: $text-placeholder;
        margin-left: 12rpx;
      }
      
      .btn-bind {
        margin: 0;
        padding: 0 20rpx;
        height: 52rpx;
        line-height: 52rpx;
        font-size: $font-size-xs;
        color: #fff;
        background-color: $primary-color;
        border-radius: $radius-round;
        margin-left: 16rpx;
        
        &::after { border: none; }
      }
    }
  }
}

// 弹窗样式
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  @include flex-center;
  z-index: 999;
  
  .modal-content {
    width: 600rpx;
    background-color: #fff;
    border-radius: $radius-md;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    
    .modal-title {
      font-size: $font-size-lg;
      font-weight: bold;
      text-align: center;
      margin-bottom: $spacing-lg;
    }
    
    .modal-input {
      background-color: $bg-gray;
      height: 80rpx;
      border-radius: $radius-base;
      padding: 0 $spacing-base;
      font-size: $font-size-base;
      margin-bottom: $spacing-lg;
    }
    
    .modal-btns {
      display: flex;
      border-top: 1rpx solid $border-light;
      margin: 0 (-$spacing-lg) (-$spacing-lg);
      
      .btn-cancel, .btn-confirm {
        flex: 1;
        height: 100rpx;
        @include flex-center;
        font-size: $font-size-base;
      }
      
      .btn-cancel {
        color: $text-regular;
        border-right: 1rpx solid $border-light;
      }
      
      .btn-confirm {
        color: $primary-color;
        font-weight: bold;
      }
    }
  }
}
</style>