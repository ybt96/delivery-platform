<template>
  <view class="publish-page">
    <view class="form-group">
      <!-- 出发地/目的地 -->
      <view class="route-section">
        <view class="route-item" @click="pickLocation('from')">
          <text class="dot from"></text>
          <view class="content border-bottom">
            <text class="label">出发地</text>
            <text class="value" :class="{ placeholder: !form.fromPlace }">{{ form.fromPlace || '请选择出发地' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="route-item" @click="pickLocation('to')">
          <text class="dot to"></text>
          <view class="content">
            <text class="label">目的地</text>
            <text class="value" :class="{ placeholder: !form.toPlace }">{{ form.toPlace || '请选择目的地' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="swap-btn" @click="swapRoute">⇅</view>
      </view>
    </view>
    
    <view class="form-group">
      <!-- 出发时间 -->
      <picker mode="multiSelector" :range="timeRange" @change="onTimeChange" @columnchange="onTimeColumnChange">
        <view class="form-item border-bottom">
          <text class="label">出发时间</text>
          <text class="value" :class="{ placeholder: !form.departureTime }">{{ form.departureTime || '请选择出发时间' }}</text>
          <text class="arrow">›</text>
        </view>
      </picker>
      
      <!-- 提供座位 -->
      <view class="form-item border-bottom">
        <text class="label">提供座位</text>
        <view class="seat-picker">
          <view class="btn-minus" @click="form.seats > 1 && form.seats--">-</view>
          <text class="num">{{ form.seats }}</text>
          <view class="btn-plus" @click="form.seats < 6 && form.seats++">+</view>
        </view>
        <text class="unit">座</text>
      </view>
      
      <!-- 预估价格 -->
      <view class="form-item">
        <text class="label">单座价格</text>
        <input class="input" type="digit" v-model="form.price" placeholder="请输入单座价格" />
        <text class="unit">元</text>
      </view>
    </view>
    
    <!-- 其他说明 -->
    <view class="form-group">
      <view class="form-item align-top">
        <text class="label">其他说明</text>
        <textarea 
          class="textarea" 
          v-model="form.description" 
          placeholder="如：途径哪些地方、是否可带大件行李等" 
          maxlength="100"
        />
      </view>
    </view>
    
    <view class="btn-section">
      <button class="btn-submit" @click="handleSubmit">发布行程</button>
      <text class="tips">发布行程代表您同意《顺风车合乘协议》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { publishTrip } from '@/api/carpool'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const form = ref({
  fromPlace: '',
  toPlace: '',
  departureTime: '',
  seats: 3,
  price: '',
  description: ''
})

// 时间选择器数据构造 (简化版)
const generateTimeRange = () => {
  const days = ['今天', '明天', '后天']
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + '点')
  const minutes = ['00分', '10分', '20分', '30分', '40分', '50分']
  return [days, hours, minutes]
}

const timeRange = ref(generateTimeRange())

const onTimeChange = (e) => {
  const [d, h, m] = e.detail.value
  const day = timeRange.value[0][d]
  const hour = timeRange.value[1][h].replace('点', '')
  const min = timeRange.value[2][m].replace('分', '')
  
  // 实际项目需要转换为标准的 datetime 格式
  form.value.departureTime = `${day} ${hour}:${min}`
}

const onTimeColumnChange = (e) => {
  // 可以根据日期动态改变可用的小时（比如今天已经过去的时间不能选）
}

const swapRoute = () => {
  const temp = form.value.fromPlace
  form.value.fromPlace = form.value.toPlace
  form.value.toPlace = temp
}

const pickLocation = (type) => {
  uni.showActionSheet({
    itemList: ['某某村', '县城', '乡镇集市', '市区', '火车站'],
    success: (res) => {
      const place = ['某某村', '县城', '乡镇集市', '市区', '火车站'][res.tapIndex]
      if (type === 'from') {
        form.value.fromPlace = place
      } else {
        form.value.toPlace = place
      }
    }
  })
}

const handleSubmit = async () => {
  if (!form.value.fromPlace) return uni.showToast({ title: '请选择出发地', icon: 'none' })
  if (!form.value.toPlace) return uni.showToast({ title: '请选择目的地', icon: 'none' })
  if (!form.value.departureTime) return uni.showToast({ title: '请选择出发时间', icon: 'none' })
  if (!form.value.price) return uni.showToast({ title: '请输入单座价格', icon: 'none' })
  
  try {
    uni.showLoading({ title: '发布中' })
    // await publishTrip(form.value)
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }, 1000)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '发布失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.publish-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-sm 0;
}

.form-group {
  background-color: #fff;
  margin-bottom: $spacing-sm;
  padding: 0 $spacing-base;
}

.border-bottom {
  border-bottom: 1rpx solid $border-light;
}

// 路线选择
.route-section {
  position: relative;
  
  .route-item {
    display: flex;
    align-items: center;
    
    .dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      margin-right: $spacing-base;
      
      &.from { background-color: $primary-color; }
      &.to { background-color: $secondary-color; }
    }
    
    .content {
      flex: 1;
      display: flex;
      align-items: center;
      padding: $spacing-base 0;
      
      .label {
        width: 120rpx;
        font-size: $font-size-base;
        color: $text-regular;
      }
      
      .value {
        flex: 1;
        font-size: $font-size-lg;
        color: $text-primary;
        font-weight: bold;
        
        &.placeholder {
          color: $text-placeholder;
          font-weight: normal;
        }
      }
      
      .arrow {
        font-size: 32rpx;
        color: $text-placeholder;
        padding-left: $spacing-sm;
      }
    }
  }
  
  .swap-btn {
    position: absolute;
    right: 40rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 64rpx;
    height: 64rpx;
    @include flex-center;
    background-color: $bg-gray;
    border-radius: 50%;
    font-size: 32rpx;
    color: $primary-color;
    z-index: 10;
  }
}

// 通用表单项
.form-item {
  display: flex;
  align-items: center;
  padding: $spacing-base 0;
  
  &.align-top {
    align-items: flex-start;
  }
  
  .label {
    width: 160rpx;
    font-size: $font-size-base;
    color: $text-primary;
  }
  
  .value {
    flex: 1;
    font-size: $font-size-base;
    color: $text-primary;
    text-align: right;
    
    &.placeholder {
      color: $text-placeholder;
    }
  }
  
  .input {
    flex: 1;
    font-size: $font-size-base;
    text-align: right;
  }
  
  .textarea {
    flex: 1;
    height: 160rpx;
    font-size: $font-size-base;
    line-height: 1.5;
  }
  
  .unit {
    font-size: $font-size-base;
    color: $text-regular;
    margin-left: $spacing-sm;
  }
  
  .arrow {
    font-size: 32rpx;
    color: $text-placeholder;
    margin-left: $spacing-sm;
  }
  
  .seat-picker {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    
    .btn-minus, .btn-plus {
      width: 56rpx;
      height: 56rpx;
      @include flex-center;
      background-color: $bg-gray;
      border-radius: $radius-sm;
      font-size: 32rpx;
      color: $primary-color;
    }
    
    .num {
      width: 80rpx;
      text-align: center;
      font-size: $font-size-lg;
      font-weight: bold;
    }
  }
}

.btn-section {
  padding: $spacing-xl $spacing-base;
  text-align: center;
  
  .btn-submit {
    @include btn-primary;
    width: 100%;
    margin-bottom: $spacing-base;
  }
  
  .tips {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}
</style>