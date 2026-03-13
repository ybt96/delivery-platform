<template>
  <view class="review-page">
    <scroll-view scroll-y class="page-scroll">
      <view class="review-card">
        <view class="card-title">订单评价</view>
        <view class="card-desc">分享一下本次购物体验，帮助更多乡亲做出选择</view>

        <view class="section">
          <view class="section-label required">评分</view>
          <view class="star-row">
            <view
              v-for="star in 5"
              :key="star"
              class="star-item"
              @tap="setRating(star)"
            >
              <text :class="['star-icon', { active: star <= form.rating }]">★</text>
              <text class="star-text">{{ ratingTexts[star - 1] }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-label">评价标签</view>
          <view class="tag-row">
            <view
              v-for="tag in tagOptions"
              :key="tag"
              :class="['tag-item', { active: form.tags.includes(tag) }]"
              @tap="toggleTag(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-label required">评价内容</view>
          <textarea
            v-model="form.content"
            class="review-textarea"
            maxlength="200"
            placeholder="商品是否新鲜、配送是否及时、服务是否满意..."
          />
          <view class="textarea-footer">
            <text class="textarea-tip">至少填写 5 个字，更有参考价值</text>
            <text class="char-count">{{ form.content.length }}/200</text>
          </view>
        </view>

        <view class="section">
          <view class="section-label">上传图片</view>
          <view class="image-row">
            <view
              v-for="(img, index) in form.images"
              :key="img"
              class="image-item"
            >
              <image :src="img" class="preview-image" mode="aspectFill" />
              <view class="remove-btn" @tap="removeImage(index)">×</view>
            </view>

            <view
              v-if="form.images.length < 3"
              class="add-image"
              @tap="chooseImage"
            >
              <text class="add-icon">＋</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="anonymous-row" @tap="form.anonymous = !form.anonymous">
            <view class="anonymous-left">
              <text class="anonymous-title">匿名评价</text>
              <text class="anonymous-desc">评价内容将隐藏昵称和头像</text>
            </view>
            <switch :checked="form.anonymous" color="#4CAF50" />
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="submitReview">
        {{ submitting ? '提交中...' : '提交评价' }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { evaluateOrder } from '@/api/order'

const submitting = ref(false)
const orderId = ref('')

const ratingTexts = ['很差', '一般', '还行', '满意', '超赞']
const tagOptions = ['新鲜实惠', '配送很快', '包装完整', '服务热情', '值得回购', '价格透明']

const form = reactive({
  rating: 5,
  content: '',
  tags: [],
  images: [],
  anonymous: false
})

onLoad((options) => {
  orderId.value = options.id || ''
})

function setRating(star) {
  form.rating = star
}

function toggleTag(tag) {
  const exists = form.tags.includes(tag)
  form.tags = exists ? form.tags.filter(item => item !== tag) : [...form.tags, tag]
}

function chooseImage() {
  uni.chooseImage({
    count: 3 - form.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.images = [...form.images, ...res.tempFilePaths].slice(0, 3)
    }
  })
}

function removeImage(index) {
  form.images.splice(index, 1)
}

function validate() {
  if (!orderId.value) {
    uni.showToast({ title: '订单信息缺失', icon: 'none' })
    return false
  }

  if (!form.content.trim() || form.content.trim().length < 5) {
    uni.showToast({ title: '请至少填写5个字', icon: 'none' })
    return false
  }

  return true
}

async function submitReview() {
  if (submitting.value) return
  if (!validate()) return

  submitting.value = true
  try {
    await evaluateOrder(orderId.value, {
      rating: form.rating,
      content: form.content.trim(),
      tags: form.tags,
      images: form.images,
      anonymous: form.anonymous
    })

    uni.showToast({ title: '评价已提交', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/order/detail?id=${orderId.value}`
      })
    }, 500)
  } catch (error) {
    console.error('submitReview error:', error)
    uni.showToast({ title: '评价提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.page-scroll {
  height: 100vh;
}

.review-card {
  margin: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.card-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.section {
  margin-top: 36rpx;
}

.section-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;

  &.required::after {
    content: ' *';
    color: #ff4d4f;
  }
}

.star-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.star-item {
  flex: 1;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 20rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.star-icon {
  font-size: 40rpx;
  color: #ddd;

  &.active {
    color: #FFB400;
  }
}

.star-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #666;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 24rpx;
  border: 1rpx solid transparent;

  &.active {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.25);
  }
}

.review-textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #333;
}

.textarea-footer {
  margin-top: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.textarea-tip,
.char-count {
  font-size: 22rpx;
  color: #999;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item,
.add-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  text-align: center;
  line-height: 36rpx;
  font-size: 24rpx;
}

.add-image {
  background: #f8f8f8;
  border: 2rpx dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.add-icon {
  font-size: 42rpx;
  line-height: 1;
}

.add-text {
  margin-top: 10rpx;
  font-size: 22rpx;
}

.anonymous-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.anonymous-left {
  display: flex;
  flex-direction: column;
}

.anonymous-title {
  font-size: 28rpx;
  color: #333;
}

.anonymous-desc {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #66BB6A, #43A047);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;

  &.disabled {
    opacity: 0.6;
  }
}
</style>