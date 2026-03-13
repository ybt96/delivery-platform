<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">{{ config.APP_NAME }}</text>
      <text class="subtitle">乡里乡亲，互助前行</text>
    </view>

    <view class="login-body">
      <!-- 微信一键登录（默认推荐） -->
      <view v-if="loginType === 'wechat'" class="login-form">
        <button 
          class="btn-wechat" 
          open-type="getPhoneNumber" 
          @getphonenumber="handleWechatLogin"
        >
          <text class="iconfont icon-wechat"></text>
          <text>微信一键登录</text>
        </button>
        <view class="switch-type" @click="loginType = 'phone'">
          <text>手机号验证码登录</text>
        </view>
      </view>

      <!-- 手机号登录 -->
      <view v-else class="login-form">
        <view class="input-group">
          <text class="prefix">+86</text>
          <input 
            class="input" 
            type="number" 
            v-model="phone" 
            placeholder="请输入手机号" 
            maxlength="11"
          />
        </view>
        
        <view class="input-group">
          <input 
            class="input" 
            type="number" 
            v-model="code" 
            placeholder="请输入验证码" 
            maxlength="6"
          />
          <view class="btn-code" :class="{ disabled: countdown > 0 }" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
          </view>
        </view>

        <button class="btn-primary" @click="handlePhoneLogin">登录</button>
        
        <view class="switch-type" @click="loginType = 'wechat'">
          <text>微信一键登录</text>
        </view>
      </view>
    </view>

    <!-- 协议 -->
    <view class="login-footer">
      <label class="agreement" @click="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="iconfont icon-check"></text>
        </view>
        <text class="text">我已阅读并同意</text>
      </label>
      <text class="link" @click="goToAgreement('user')">《用户协议》</text>
      <text class="text">和</text>
      <text class="link" @click="goToAgreement('privacy')">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/modules/user'
import { wxLogin, phoneLogin, sendCode } from '@/api/auth'
import validate from '@/utils/validate'
import config from '@/common/config'

const userStore = useUserStore()

const loginType = ref('wechat') // 'wechat' 或 'phone'
const phone = ref('')
const code = ref('')
const countdown = ref(0)
const agreed = ref(false)
let timer = null

// 处理微信一键登录
const handleWechatLogin = async (e) => {
  if (!agreed.value) {
    return uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
  }

  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    return uni.showToast({ title: '需要获取手机号才能登录', icon: 'none' })
  }

  try {
    uni.showLoading({ title: '登录中...' })
    
    // 获取微信登录 code
    const [loginErr, loginRes] = await uni.login({ provider: 'weixin' })
    if (loginErr || !loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    const { encryptedData, iv } = e.detail
    
    // 调用后端登录接口
    const res = await wxLogin({
      code: loginRes.code,
      encryptedData,
      iv
    })

    loginSuccess(res)
  } catch (error) {
    console.error('微信登录失败', error)
  } finally {
    uni.hideLoading()
  }
}

// 发送验证码
const handleSendCode = async () => {
  if (countdown.value > 0) return
  
  if (!validate.isPhone(phone.value)) {
    return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  }

  try {
    uni.showLoading({ title: '发送中...' })
    await sendCode({ phone: phone.value })
    uni.hideLoading()
    uni.showToast({ title: '发送成功', icon: 'success' })
    
    // 开始倒计时
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    uni.hideLoading()
  }
}

// 手机号登录
const handlePhoneLogin = async () => {
  if (!agreed.value) {
    return uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
  }

  if (!validate.isPhone(phone.value)) {
    return uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
  }

  if (!code.value || code.value.length !== 6) {
    return uni.showToast({ title: '请输入6位验证码', icon: 'none' })
  }

  try {
    uni.showLoading({ title: '登录中...' })
    const res = await phoneLogin({
      phone: phone.value,
      code: code.value
    })
    
    loginSuccess(res)
  } catch (error) {
    uni.hideLoading()
  }
}

// 登录成功处理
const loginSuccess = (res) => {
  userStore.setToken(res.token)
  userStore.setUserInfo(res.userInfo)
  
  uni.hideLoading()
  uni.showToast({ title: '登录成功', icon: 'success' })
  
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/index/index'
    })
  }, 1500)
}

// 查看协议
const goToAgreement = (type) => {
  uni.navigateTo({
    url: `/pages/common/webview?type=${type}`
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #fff;
  padding: 0 60rpx;
  display: flex;
  flex-direction: column;
}

.login-header {
  margin-top: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 40rpx;
    margin-bottom: 32rpx;
  }
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: $text-secondary;
  }
}

.login-body {
  margin-top: 100rpx;
  flex: 1;
}

.login-form {
  width: 100%;
  
  .input-group {
    display: flex;
    align-items: center;
    height: 100rpx;
    border-bottom: 1rpx solid $border-color;
    margin-bottom: 40rpx;
    
    .prefix {
      font-size: 32rpx;
      color: $text-primary;
      margin-right: 20rpx;
      padding-right: 20rpx;
      border-right: 1rpx solid $border-color;
    }
    
    .input {
      flex: 1;
      height: 100%;
      font-size: 32rpx;
    }
    
    .btn-code {
      font-size: 28rpx;
      color: $primary-color;
      padding: 10rpx 20rpx;
      
      &.disabled {
        color: $text-secondary;
      }
    }
  }
}

.btn-wechat {
  width: 100%;
  height: 90rpx;
  background-color: #07C160;
  color: #fff;
  border-radius: 45rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  margin-bottom: 40rpx;
  
  .iconfont {
    margin-right: 16rpx;
    font-size: 40rpx;
  }
  
  &::after {
    border: none;
  }
}

.btn-primary {
  width: 100%;
  height: 90rpx;
  background-color: $primary-color;
  color: #fff;
  border-radius: 45rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  margin-top: 60rpx;
  
  &::after {
    border: none;
  }
}

.switch-type {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: $text-secondary;
}

.login-footer {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  margin-bottom: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  flex-wrap: wrap;
  
  .agreement {
    display: flex;
    align-items: center;
    
    .checkbox {
      width: 32rpx;
      height: 32rpx;
      border: 2rpx solid $border-color;
      border-radius: 50%;
      margin-right: 12rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      
      &.checked {
        background-color: $primary-color;
        border-color: $primary-color;
      }
      
      .iconfont {
        color: #fff;
        font-size: 20rpx;
      }
    }
  }
  
  .text {
    color: $text-secondary;
  }
  
  .link {
    color: $primary-color;
  }
}
</style>