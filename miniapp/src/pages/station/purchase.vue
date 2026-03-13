<template>
  <view class="purchase-page">
    <scroll-view scroll-y class="page-scroll">
      <!-- 代购说明 -->
      <view class="tips-card">
        <view class="tips-title">
          <text class="tips-icon">💡</text>
          <text>代购服务说明</text>
        </view>
        <text class="tips-content">
          填写您需要代购的商品信息，站长将在进城时帮您采购，代购费用根据商品和距离计算。
        </text>
      </view>

      <!-- 表单区域 -->
      <view class="form-card">
        <!-- 商品名称 -->
        <view class="form-item">
          <text class="form-label required">商品名称</text>
          <input
            v-model="form.productName"
            class="form-input"
            placeholder="请填写需要代购的商品名称"
            maxlength="100"
          />
        </view>

        <!-- 数量 -->
        <view class="form-item">
          <text class="form-label required">数量</text>
          <view class="qty-control">
            <view class="qty-btn" @tap="changeQty(-1)">－</view>
            <input
              v-model="form.quantity"
              class="qty-input"
              type="number"
              placeholder="1"
            />
            <view class="qty-btn" @tap="changeQty(1)">＋</view>
          </view>
        </view>

        <!-- 预算价格 -->
        <view class="form-item">
          <text class="form-label">预算金额（元）</text>
          <view class="input-with-unit">
            <input
              v-model="form.budget"
              class="form-input"
              type="digit"
              placeholder="请填写预算金额（选填）"
            />
            <text class="input-unit">元</text>
          </view>
        </view>

        <!-- 商品图片参考 -->
        <view class="form-item">
          <text class="form-label">参考图片</text>
          <view class="image-picker">
            <view
              v-for="(img, idx) in form.images"
              :key="idx"
              class="image-item"
            >
              <image :src="img" class="preview-image" mode="aspectFill" />
              <view class="remove-btn" @tap="removeImage(idx)">×</view>
            </view>
            <view
              v-if="form.images.length < 3"
              class="add-image-btn"
              @tap="chooseImage"
            >
              <text class="add-icon">＋</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="form-item">
          <text class="form-label">备注说明</text>
          <textarea
            v-model="form.remark"
            class="form-textarea"
            placeholder="如有特殊要求请在此说明（品牌、规格等）"
            maxlength="200"
          />
          <text class="char-count">{{ form.remark.length }}/200</text>
        </view>
      </view>

      <!-- 收货信息 -->
      <view class="form-card">
        <view class="section-title">收货信息</view>

        <view class="form-item">
          <text class="form-label required">收货人</text>
          <input
            v-model="form.contactName"
            class="form-input"
            placeholder="请填写收货人姓名"
          />
        </view>

        <view class="form-item">
          <text class="form-label required">联系电话</text>
          <input
            v-model="form.contactPhone"
            class="form-input"
            type="tel"
            placeholder="请填写联系电话"
            maxlength="11"
          />
        </view>

        <view class="form-item">
          <text class="form-label required">收货地址</text>
          <input
            v-model="form.deliveryAddress"
            class="form-input"
            placeholder="请填写详细收货地址"
          />
        </view>

        <!-- 期望时间 -->
        <view class="form-item">
          <text class="form-label">期望送达时间</text>
          <picker
            mode="date"
            :value="form.expectedDate"
            :start="minDate"
            @change="onDateChange"
          >
            <view class="picker-display">
              <text :class="form.expectedDate ? 'picker-value' : 'picker-placeholder'">
                {{ form.expectedDate || '请选择期望日期（选填）' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 代购费说明 -->
      <view class="fee-card">
        <view class="fee-row">
          <text class="fee-label">商品费用</text>
          <text class="fee-value">按实际采购金额结算</text>
        </view>
        <view class="fee-row">
          <text class="fee-label">代购服务费</text>
          <text class="fee-value highlight">免费（试运营期）</text>
        </view>
        <view class="fee-tips">* 代购完成后，站长会联系您确认金额后收款</view>
      </view>
    </scroll-view>

    <!-- 底部提交 -->
    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="submitOrder">
        <text>{{ submitting ? '提交中...' : '提交代购申请' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useStationStore } from '@/store/modules/station'
import { useUserStore } from '@/store/modules/user'

const stationStore = useStationStore()
const userStore = useUserStore()

const submitting = ref(false)
const stationId = ref(null)

const form = reactive({
  productName: '',
  quantity: 1,
  budget: '',
  images: [],
  remark: '',
  contactName: userStore.userInfo.nickname || '',
  contactPhone: userStore.userInfo.phone || '',
  deliveryAddress: '',
  expectedDate: ''
})

// 最小日期：明天
const minDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const sid = currentPage.options?.stationId
  if (sid) stationId.value = sid
})

function changeQty(delta) {
  const newQty = Number(form.quantity) + delta
  if (newQty >= 1 && newQty <= 99) {
    form.quantity = newQty
  }
}

async function chooseImage() {
  if (form.images.length >= 3) return
  uni.chooseImage({
    count: 3 - form.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.images = [...form.images, ...res.tempFilePaths].slice(0, 3)
    }
  })
}

function removeImage(idx) {
  form.images.splice(idx, 1)
}

function onDateChange(e) {
  form.expectedDate = e.detail.value
}

function validate() {
  if (!form.productName.trim()) {
    uni.showToast({ title: '请填写商品名称', icon: 'none' })
    return false
  }
  if (!form.contactName.trim()) {
    uni.showToast({ title: '请填写收货人姓名', icon: 'none' })
    return false
  }
  if (!form.contactPhone.trim() || !/^1\d{10}$/.test(form.contactPhone)) {
    uni.showToast({ title: '请填写正确的联系电话', icon: 'none' })
    return false
  }
  if (!form.deliveryAddress.trim()) {
    uni.showToast({ title: '请填写收货地址', icon: 'none' })
    return false
  }
  return true
}

async function submitOrder() {
  if (submitting.value) return
  if (!validate()) return

  submitting.value = true
  try {
    const payload = {
      stationId: stationId.value,
      productName: form.productName.trim(),
      quantity: Number(form.quantity),
      budget: form.budget ? Number(form.budget) : undefined,
      images: form.images,
      remark: form.remark.trim(),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      deliveryAddress: form.deliveryAddress.trim(),
      expectedDate: form.expectedDate || undefined
    }
    await stationStore.createPurchaseOrder(payload)
    uni.showToast({ title: '代购申请已提交', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/station/orders' })
    }, 1500)
  } catch (err) {
    console.error('submitOrder error:', err)
    uni.showToast({
      title: err?.message || '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.purchase-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.page-scroll {
  flex: 1;
  padding-bottom: 160rpx;
}

.tips-card {
  background: #fffde7;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx;

  .tips-title {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #f57c00;

    .tips-icon {
      margin-right: 8rpx;
    }
  }

  .tips-content {
    font-size: 24rpx;
    color: #795548;
    line-height: 1.7;
  }
}

.form-card {
  background: #ffffff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
}

.form-item {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    font-size: 26rpx;
    color: #666;
    display: block;
    margin-bottom: 12rpx;

    &.required::before {
      content: '* ';
      color: #f44336;
    }
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    background: #f9f9f9;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
  }
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 0;

  .qty-btn {
    width: 64rpx;
    height: 64rpx;
    background: #f0f0f0;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #333;
  }

  .qty-input {
    width: 120rpx;
    height: 64rpx;
    text-align: center;
    font-size: 30rpx;
    color: #333;
    margin: 0 16rpx;
    background: #f9f9f9;
    border-radius: 8rpx;
  }
}

.input-with-unit {
  display: flex;
  align-items: center;

  .form-input {
    flex: 1;
  }

  .input-unit {
    font-size: 26rpx;
    color: #999;
    margin-left: 12rpx;
    flex-shrink: 0;
  }
}

.image-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .image-item {
    position: relative;
    width: 160rpx;
    height: 160rpx;

    .preview-image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }

    .remove-btn {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 28rpx;
    }
  }

  .add-image-btn {
    width: 160rpx;
    height: 160rpx;
    background: #f5f5f5;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .add-icon {
      font-size: 48rpx;
      color: #ccc;
      line-height: 1;
      margin-bottom: 8rpx;
    }

    .add-text {
      font-size: 22rpx;
      color: #bbb;
    }
  }
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  line-height: 1.6;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 8rpx;
}

.picker-display {
  height: 80rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .picker-value {
    font-size: 28rpx;
    color: #333;
  }

  .picker-placeholder {
    font-size: 28rpx;
    color: #bbb;
  }

  .picker-arrow {
    font-size: 32rpx;
    color: #ccc;
  }
}

.fee-card {
  background: #ffffff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;

  .fee-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-of-type {
      border-bottom: none;
    }

    .fee-label {
      font-size: 26rpx;
      color: #666;
    }

    .fee-value {
      font-size: 26rpx;
      color: #333;

      &.highlight {
        color: #4CAF50;
        font-weight: 600;
      }
    }
  }

  .fee-tips {
    font-size: 22rpx;
    color: #bbb;
    margin-top: 12rpx;
    line-height: 1.6;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .submit-btn {
    height: 96rpx;
    background: #4CAF50;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 600;

    &.disabled {
      background: #a5d6a7;
    }
  }
}
</style>