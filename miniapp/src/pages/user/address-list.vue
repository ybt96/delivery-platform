<template>
  <view class="address-page">
    <scroll-view class="address-list" scroll-y v-if="addresses.length > 0">
      <view 
        class="address-item" 
        v-for="item in addresses" 
        :key="item.id"
        @click="handleSelect(item)"
      >
        <view class="item-left">
          <view class="user-info">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
            <text v-if="item.isDefault" class="tag-default">默认</text>
            <text v-if="item.tag" class="tag-custom">{{ item.tag }}</text>
          </view>
          <view class="detail-address">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
          </view>
        </view>
        <view class="item-right" @click.stop="goEdit(item.id)">
          <text class="edit-icon">编辑</text>
        </view>
      </view>
    </scroll-view>
    
    <view v-else class="empty-wrap">
      <Empty text="暂无收货地址" />
    </view>
    
    <view class="bottom-bar safe-bottom">
      <button class="btn-add" @click="goEdit()">添加新地址</button>
      <button class="btn-wx" @click="getWxAddress">获取微信地址</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const { addresses } = storeToRefs(userStore)
const isSelectMode = ref(false)

onLoad((options) => {
  if (options.select === 'true') {
    isSelectMode.value = true
  }
  
  // 如果没有地址数据，添加几条模拟数据
  if (addresses.value.length === 0) {
    userStore.setAddresses([
      {
        id: '1',
        name: '张三',
        phone: '13800138000',
        province: '浙江省',
        city: '广州市',
        district: '天河区',
        detail: '某某街道某某村1号',
        isDefault: true,
        tag: '家'
      },
      {
        id: '2',
        name: '李四',
        phone: '13900139000',
        province: '浙江省',
        city: '广州市',
        district: '海珠区',
        detail: '某某路某某大厦',
        isDefault: false,
        tag: '公司'
      }
    ])
  }
})

const handleSelect = (item) => {
  if (!isSelectMode.value) return
  
  // 触发全局事件，供上一页监听
  uni.$emit('selectAddress', item)
  uni.navigateBack()
}

const goEdit = (id = '') => {
  uni.navigateTo({
    url: `/pages/user/address-edit?id=${id}`
  })
}

const getWxAddress = () => {
  uni.chooseAddress({
    success: (res) => {
      const newAddr = {
        id: Date.now().toString(),
        name: res.userName,
        phone: res.telNumber,
        province: res.provinceName,
        city: res.cityName,
        district: res.countyName,
        detail: res.detailInfo,
        isDefault: addresses.value.length === 0,
        tag: ''
      }
      userStore.addAddress(newAddr)
      uni.showToast({ title: '添加成功', icon: 'success' })
    },
    fail: (err) => {
      console.error('获取微信地址失败', err)
      if (err.errMsg.indexOf('auth deny') > -1) {
        uni.showModal({
          title: '提示',
          content: '需要您授权才能获取微信地址',
          confirmText: '去授权',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting()
            }
          }
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.address-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
  padding-bottom: 140rpx; // 为底部按钮留出空间
}

.address-list {
  flex: 1;
  padding: $spacing-sm;
}

.address-item {
  background-color: #fff;
  border-radius: $radius-base;
  padding: $spacing-base;
  margin-bottom: $spacing-sm;
  display: flex;
  align-items: center;
  
  .item-left {
    flex: 1;
    margin-right: $spacing-base;
    
    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .name {
        font-size: $font-size-lg;
        font-weight: bold;
        color: $text-primary;
        margin-right: $spacing-sm;
      }
      
      .phone {
        font-size: $font-size-md;
        color: $text-regular;
        margin-right: $spacing-sm;
      }
      
      .tag-default {
        @include tag($primary-color);
        margin-right: 8rpx;
      }
      
      .tag-custom {
        @include tag($info-color);
      }
    }
    
    .detail-address {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.5;
    }
  }
  
  .item-right {
    padding-left: $spacing-base;
    border-left: 1rpx solid $border-light;
    
    .edit-icon {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.empty-wrap {
  flex: 1;
  @include flex-center;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: $spacing-sm $spacing-base;
  display: flex;
  gap: $spacing-sm;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  
  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: $font-size-base;
    
    &::after { border: none; }
  }
  
  .btn-add {
    background-color: $primary-color;
    color: #fff;
  }
  
  .btn-wx {
    background-color: #f0f9eb;
    color: $primary-color;
    border: 1rpx solid $primary-light;
  }
}
</style>