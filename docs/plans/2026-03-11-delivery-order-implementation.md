# 配送预约与订单管理功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现配送预约和订单管理功能，包括配送班次选择、订单详情查看、配送状态跟踪、订单操作等完整功能。

**Architecture:** 采用混合式设计方案，在订单流程中集成配送预约选项，同时提供独立的配送管理页面。使用Uni-app (Vue 3)框架，Pinia状态管理，以及封装的API请求。

**Tech Stack:** Uni-app (Vue 3), Pinia, SCSS, uni-ui

---

## 任务1: 创建配送相关页面

**Files:**
- Create: `miniapp/pages/delivery/index.vue`
- Create: `miniapp/pages/delivery/booking.vue`
- Modify: `miniapp/pages.json`

**Step 1: 修改pages.json配置**

```json
{
  "path": "pages/delivery/index",
  "style": {
    "navigationBarTitleText": "配送管理"
  }
},
{
  "path": "pages/delivery/booking",
  "style": {
    "navigationBarTitleText": "配送预约"
  }
}
```

**Step 2: 创建配送管理页面**

```vue
<template>
  <view class="delivery-container">
    <view class="section">
      <text class="section-title">我的配送预约</text>
      <view v-for="booking in bookings" :key="booking.id" class="booking-item">
        <view class="booking-info">
          <text class="booking-date">{{ booking.date }}</text>
          <text class="booking-time">{{ booking.time }}</text>
        </view>
        <view class="booking-status">{{ booking.status }}</view>
        <button v-if="booking.status === '待配送'" @click="modifyBooking(booking.id)" class="modify-btn">修改预约</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDeliveryStore } from '@/store/modules/delivery';

const deliveryStore = useDeliveryStore();
const bookings = ref([]);

onMounted(() => {
  // 模拟数据
  bookings.value = [
    { id: 1, date: '2026-03-12', time: '09:00-11:00', status: '待配送' },
    { id: 2, date: '2026-03-11', time: '14:00-16:00', status: '已完成' }
  ];
});

const modifyBooking = (bookingId) => {
  uni.navigateTo({
    url: '/pages/delivery/booking?bookingId=' + bookingId
  });
};
</script>

<style lang="scss">
.delivery-container {
  padding: 20rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.booking-item {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.booking-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.booking-date {
  font-size: 16px;
  font-weight: 500;
}

.booking-time {
  font-size: 14px;
  color: #666;
}

.booking-status {
  font-size: 14px;
  color: #4CAF50;
  margin-bottom: 10rpx;
}

.modify-btn {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 10rpx 20rpx;
  border-radius: 5rpx;
  font-size: 14px;
}
</style>
```

**Step 3: 创建配送预约页面**

```vue
<template>
  <view class="booking-container">
    <view class="date-selector">
      <button @click="changeDate(-1)" class="date-btn">&lt;</button>
      <text class="current-date">{{ currentDate }}</text>
      <button @click="changeDate(1)" class="date-btn">&gt;</button>
    </view>
    <view class="schedule-list">
      <view v-for="schedule in schedules" :key="schedule.id" 
           :class="['schedule-item', { 'selected': selectedSchedule === schedule.id, 'disabled': schedule.status !== 'available' }]"
           @click="selectSchedule(schedule.id)"
      >
        <text class="schedule-time">{{ schedule.time }}</text>
        <text class="schedule-status">{{ schedule.status === 'available' ? '可预约' : schedule.status === 'full' ? '已满' : '已过期' }}</text>
      </view>
    </view>
    <button v-if="selectedSchedule" @click="confirmBooking" class="confirm-btn">确认预约</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentDate = ref('2026-03-12');
const selectedSchedule = ref(null);
const schedules = ref([
  { id: 1, time: '09:00-11:00', status: 'available' },
  { id: 2, time: '11:00-13:00', status: 'full' },
  { id: 3, time: '14:00-16:00', status: 'available' },
  { id: 4, time: '16:00-18:00', status: 'available' }
]);

const changeDate = (delta) => {
  // 模拟日期变更
  currentDate.value = '2026-03-13';
};

const selectSchedule = (scheduleId) => {
  const schedule = schedules.value.find(s => s.id === scheduleId);
  if (schedule && schedule.status === 'available') {
    selectedSchedule.value = scheduleId;
  }
};

const confirmBooking = () => {
  // 模拟确认预约
  uni.showToast({
    title: '预约成功',
    icon: 'success'
  });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style lang="scss">
.booking-container {
  padding: 20rpx;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
}

.date-btn {
  background-color: #f5f5f5;
  border: none;
  padding: 10rpx 20rpx;
  border-radius: 5rpx;
  font-size: 16px;
}

.current-date {
  font-size: 16px;
  font-weight: 500;
}

.schedule-list {
  margin-bottom: 30rpx;
}

.schedule-item {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-item.selected {
  border: 2rpx solid #4CAF50;
  background-color: #f0f9ff;
}

.schedule-item.disabled {
  opacity: 0.6;
}

.schedule-time {
  font-size: 16px;
  font-weight: 500;
}

.schedule-status {
  font-size: 14px;
  color: #666;
}

.confirm-btn {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 16px;
  font-weight: 500;
}
</style>
```

**Step 4: 提交代码**

```bash
git add miniapp/pages.json miniapp/pages/delivery/index.vue miniapp/pages/delivery/booking.vue
git commit -m "feat: add delivery pages"
```

## 任务2: 创建订单详情页

**Files:**
- Create: `miniapp/pages/order/detail.vue`
- Modify: `miniapp/pages.json`

**Step 1: 修改pages.json配置**

```json
{
  "path": "pages/order/detail",
  "style": {
    "navigationBarTitleText": "订单详情"
  }
}
```

**Step 2: 创建订单详情页面**

```vue
<template>
  <view class="order-detail-container">
    <!-- 订单状态 -->
    <view class="order-status">
      <text class="status-text">{{ order.statusText }}</text>
      <text class="status-desc">{{ order.statusDesc }}</text>
    </view>

    <!-- 配送信息 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">配送信息</text>
      </view>
      <view class="delivery-info">
        <text class="info-item">{{ order.deliveryAddress }}</text>
        <text class="info-item">{{ order.deliveryTime }}</text>
        <text class="info-item">配送员: {{ order.delivererName }} {{ order.delivererPhone }}</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">商品信息</text>
      </view>
      <view v-for="item in order.items" :key="item.id" class="product-item">
        <image :src="item.image" class="product-image"></image>
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-spec">{{ item.spec }}</text>
          <view class="product-price-count">
            <text class="product-price">¥{{ item.price }}</text>
            <text class="product-count">x{{ item.count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 费用信息 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">费用信息</text>
      </view>
      <view class="cost-info">
        <view class="cost-item">
          <text class="cost-label">商品总额</text>
          <text class="cost-value">¥{{ order.totalPrice }}</text>
        </view>
        <view class="cost-item">
          <text class="cost-label">配送费</text>
          <text class="cost-value">¥{{ order.deliveryFee }}</text>
        </view>
        <view class="cost-item total">
          <text class="cost-label">实付金额</text>
          <text class="cost-value total">¥{{ order.payAmount }}</text>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">订单信息</text>
      </view>
      <view class="order-info">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderId }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ order.createTime }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ order.payTime }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button v-if="order.status === 'pending_payment'" @click="payOrder" class="action-btn primary">立即支付</button>
      <button v-if="order.status === 'pending_delivery'" @click="cancelOrder" class="action-btn">取消订单</button>
      <button v-if="order.status === 'pending_delivery'" @click="contactMerchant" class="action-btn primary">联系商家</button>
      <button v-if="order.status === 'delivering'" @click="contactDeliverer" class="action-btn">联系配送员</button>
      <button v-if="order.status === 'delivering'" @click="trackDelivery" class="action-btn primary">查看配送</button>
      <button v-if="order.status === 'pending_receipt'" @click="confirmReceipt" class="action-btn primary">确认收货</button>
      <button v-if="order.status === 'completed'" @click="applyRefund" class="action-btn">申请退款</button>
      <button v-if="order.status === 'completed'" @click="complainOrder" class="action-btn">投诉</button>
      <button v-if="order.status === 'completed'" @click="evaluateOrder" class="action-btn primary">评价</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const order = ref({
  id: 1,
  orderId: '202603110001',
  status: 'delivering',
  statusText: '配送中',
  statusDesc: '您的订单正在配送中，请耐心等待',
  deliveryAddress: '北京市朝阳区建国路88号',
  deliveryTime: '2026-03-12 09:00-11:00',
  delivererName: '张师傅',
  delivererPhone: '138****1234',
  items: [
    {
      id: 1,
      name: '新鲜蔬菜套装',
      spec: '5斤装',
      price: 29.9,
      count: 1,
      image: 'https://via.placeholder.com/100'
    },
    {
      id: 2,
      name: '鸡蛋',
      spec: '10个装',
      price: 15.8,
      count: 2,
      image: 'https://via.placeholder.com/100'
    }
  ],
  totalPrice: 61.5,
  deliveryFee: 5,
  payAmount: 66.5,
  createTime: '2026-03-11 10:00:00',
  payTime: '2026-03-11 10:05:00'
});

const payOrder = () => {
  uni.showToast({ title: '跳转到支付页面', icon: 'none' });
};

const cancelOrder = () => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消订单吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '订单已取消', icon: 'success' });
      }
    }
  });
};

const contactMerchant = () => {
  uni.showToast({ title: '联系商家', icon: 'none' });
};

const contactDeliverer = () => {
  uni.showToast({ title: '联系配送员', icon: 'none' });
};

const trackDelivery = () => {
  uni.showToast({ title: '查看配送轨迹', icon: 'none' });
};

const confirmReceipt = () => {
  uni.showModal({
    title: '确认收货',
    content: '确定已收到商品吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '收货成功', icon: 'success' });
      }
    }
  });
};

const applyRefund = () => {
  uni.navigateTo({ url: '/pages/order/refund' });
};

const complainOrder = () => {
  uni.navigateTo({ url: '/pages/order/complaint' });
};

const evaluateOrder = () => {
  uni.navigateTo({ url: '/pages/order/evaluation' });
};
</script>

<style lang="scss">
.order-detail-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.order-status {
  background-color: #4CAF50;
  color: #fff;
  padding: 30rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.status-text {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.status-desc {
  font-size: 14px;
  opacity: 0.9;
}

.section {
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.section-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
}

.delivery-info {
  padding: 20rpx;
}

.info-item {
  font-size: 14px;
  line-height: 24rpx;
  margin-bottom: 10rpx;
  color: #333;
}

.product-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 5rpx;
  margin-right: 20rpx;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5rpx;
  display: block;
}

.product-spec {
  font-size: 14px;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.product-price-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 16px;
  font-weight: 500;
  color: #ff6b6b;
}

.product-count {
  font-size: 14px;
  color: #666;
}

.cost-info {
  padding: 20rpx;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.cost-item.total {
  margin-top: 10rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid #f0f0f0;
  font-weight: 500;
}

.cost-label {
  font-size: 14px;
  color: #666;
}

.cost-value {
  font-size: 14px;
  color: #333;
}

.cost-value.total {
  color: #ff6b6b;
  font-size: 16px;
}

.order-info {
  padding: 20rpx;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15rpx;
  margin-top: 30rpx;
  padding-bottom: 30rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 5rpx;
  font-size: 14px;
  background-color: #fff;
}

.action-btn.primary {
  background-color: #4CAF50;
  color: #fff;
  border: none;
}
</style>
```

**Step 3: 提交代码**

```bash
git add miniapp/pages.json miniapp/pages/order/detail.vue
git commit -m "feat: add order detail page"
```

## 任务3: 创建订单操作相关页面

**Files:**
- Create: `miniapp/pages/order/refund.vue`
- Create: `miniapp/pages/order/complaint.vue`
- Create: `miniapp/pages/order/evaluation.vue`
- Modify: `miniapp/pages.json`

**Step 1: 修改pages.json配置**

```json
{
  "path": "pages/order/refund",
  "style": {
    "navigationBarTitleText": "退款申请"
  }
},
{
  "path": "pages/order/complaint",
  "style": {
    "navigationBarTitleText": "投诉反馈"
  }
},
{
  "path": "pages/order/evaluation",
  "style": {
    "navigationBarTitleText": "订单评价"
  }
}
```

**Step 2: 创建退款申请页面**

```vue
<template>
  <view class="refund-container">
    <view class="section">
      <text class="section-title">退款原因</text>
      <view class="reason-options">
        <view v-for="reason in refundReasons" :key="reason.value" 
             :class="['reason-item', { 'selected': selectedReason === reason.value }]"
             @click="selectedReason = reason.value"
        >
          <text class="reason-text">{{ reason.label }}</text>
          <view v-if="selectedReason === reason.value" class="checkmark">✓</view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">退款金额</text>
      <view class="amount-input">
        <text class="currency">¥</text>
        <input v-model="refundAmount" type="number" class="amount" placeholder="请输入退款金额" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">退款说明</text>
      <textarea v-model="refundDescription" class="description" placeholder="请详细描述退款原因" />
    </view>

    <view class="section">
      <text class="section-title">上传凭证</text>
      <view class="upload-container">
        <view v-for="(image, index) in uploadedImages" :key="index" class="uploaded-image">
          <image :src="image" class="image"></image>
          <view class="remove-btn" @click="removeImage(index)">×</view>
        </view>
        <view v-if="uploadedImages.length < 5" class="upload-btn" @click="chooseImage">
          <text class="upload-icon">+</text>
          <text class="upload-text">上传图片</text>
        </view>
      </view>
    </view>

    <button @click="submitRefund" class="submit-btn">提交退款申请</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const selectedReason = ref('');
const refundAmount = ref('66.5');
const refundDescription = ref('');
const uploadedImages = ref([]);

const refundReasons = [
  { label: '商品质量问题', value: 'quality' },
  { label: '商品与描述不符', value: 'description' },
  { label: '配送延迟', value: 'delay' },
  { label: '拍错/多拍', value: 'mistake' },
  { label: '其他原因', value: 'other' }
];

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - uploadedImages.value.length,
    success: (res) => {
      uploadedImages.value = [...uploadedImages.value, ...res.tempFilePaths];
    }
  });
};

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
};

const submitRefund = () => {
  if (!selectedReason.value) {
    uni.showToast({ title: '请选择退款原因', icon: 'none' });
    return;
  }
  if (!refundAmount.value) {
    uni.showToast({ title: '请输入退款金额', icon: 'none' });
    return;
  }
  uni.showToast({ title: '退款申请已提交', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style lang="scss">
.refund-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.section {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}

.reason-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.reason-item {
  padding: 12rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.reason-item.selected {
  border-color: #4CAF50;
  background-color: #f0f9ff;
  color: #4CAF50;
}

.checkmark {
  font-size: 16px;
  font-weight: bold;
}

.amount-input {
  display: flex;
  align-items: center;
  border: 1rpx solid #ddd;
  border-radius: 5rpx;
  padding: 15rpx;
}

.currency {
  font-size: 16px;
  margin-right: 10rpx;
}

.amount {
  flex: 1;
  font-size: 16px;
  border: none;
  outline: none;
}

.description {
  width: 100%;
  height: 150rpx;
  border: 1rpx solid #ddd;
  border-radius: 5rpx;
  padding: 15rpx;
  font-size: 14px;
  resize: none;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.uploaded-image {
  width: 120rpx;
  height: 120rpx;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 5rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 30rpx;
  height: 30rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border: 1rpx dashed #ddd;
  border-radius: 5rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.upload-icon {
  font-size: 30px;
  margin-bottom: 5rpx;
}

.upload-text {
  font-size: 12px;
}

.submit-btn {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 16px;
  font-weight: 500;
  margin-top: 30rpx;
}
</style>
```

**Step 3: 创建投诉反馈页面**

```vue
<template>
  <view class="complaint-container">
    <view class="section">
      <text class="section-title">投诉类型</text>
      <view class="type-options">
        <view v-for="type in complaintTypes" :key="type.value" 
             :class="['type-item', { 'selected': selectedType === type.value }]"
             @click="selectedType = type.value"
        >
          <text class="type-text">{{ type.label }}</text>
          <view v-if="selectedType === type.value" class="checkmark">✓</view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">投诉内容</text>
      <textarea v-model="complaintContent" class="content" placeholder="请详细描述您的问题" />
    </view>

    <view class="section">
      <text class="section-title">上传凭证</text>
      <view class="upload-container">
        <view v-for="(image, index) in uploadedImages" :key="index" class="uploaded-image">
          <image :src="image" class="image"></image>
          <view class="remove-btn" @click="removeImage(index)">×</view>
        </view>
        <view v-if="uploadedImages.length < 5" class="upload-btn" @click="chooseImage">
          <text class="upload-icon">+</text>
          <text class="upload-text">上传图片</text>
        </view>
      </view>
    </view>

    <button @click="submitComplaint" class="submit-btn">提交投诉</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const selectedType = ref('');
const complaintContent = ref('');
const uploadedImages = ref([]);

const complaintTypes = [
  { label: '商品质量问题', value: 'quality' },
  { label: '配送服务问题', value: 'delivery' },
  { label: '商家服务问题', value: 'merchant' },
  { label: '其他问题', value: 'other' }
];

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - uploadedImages.value.length,
    success: (res) => {
      uploadedImages.value = [...uploadedImages.value, ...res.tempFilePaths];
    }
  });
};

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
};

const submitComplaint = () => {
  if (!selectedType.value) {
    uni.showToast({ title: '请选择投诉类型', icon: 'none' });
    return;
  }
  if (!complaintContent.value) {
    uni.showToast({ title: '请输入投诉内容', icon: 'none' });
    return;
  }
  uni.showToast({ title: '投诉已提交', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style lang="scss">
.complaint-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.section {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.type-item {
  padding: 12rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.type-item.selected {
  border-color: #4CAF50;
  background-color: #f0f9ff;
  color: #4CAF50;
}

.checkmark {
  font-size: 16px;
  font-weight: bold;
}

.content {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #ddd;
  border-radius: 5rpx;
  padding: 15rpx;
  font-size: 14px;
  resize: none;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.uploaded-image {
  width: 120rpx;
  height: 120rpx;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 5rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 30rpx;
  height: 30rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border: 1rpx dashed #ddd;
  border-radius: 5rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.upload-icon {
  font-size: 30px;
  margin-bottom: 5rpx;
}

.upload-text {
  font-size: 12px;
}

.submit-btn {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 16px;
  font-weight: 500;
  margin-top: 30rpx;
}
</style>
```

**Step 4: 创建订单评价页面**

```vue
<template>
  <view class="evaluation-container">
    <view class="section">
      <text class="section-title">商品评价</text>
      <view v-for="item in orderItems" :key="item.id" class="product-item">
        <image :src="item.image" class="product-image"></image>
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-spec">{{ item.spec }}</text>
          <view class="rating">
            <text v-for="star in 5" :key="star" 
                 :class="['star', { 'active': item.rating >= star }]"
                 @click="item.rating = star"
            >★</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">服务评价</text>
      <view class="service-rating">
        <text class="rating-label">配送服务</text>
        <view class="rating">
          <text v-for="star in 5" :key="star" 
               :class="['star', { 'active': serviceRating >= star }]"
               @click="serviceRating = star"
          >★</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">评价内容</text>
      <textarea v-model="evaluationContent" class="content" placeholder="请输入您的评价内容" />
    </view>

    <view class="section">
      <text class="section-title">上传图片</text>
      <view class="upload-container">
        <view v-for="(image, index) in uploadedImages" :key="index" class="uploaded-image">
          <image :src="image" class="image"></image>
          <view class="remove-btn" @click="removeImage(index)">×</view>
        </view>
        <view v-if="uploadedImages.length < 5" class="upload-btn" @click="chooseImage">
          <text class="upload-icon">+</text>
          <text class="upload-text">上传图片</text>
        </view>
      </view>
    </view>

    <button @click="submitEvaluation" class="submit-btn">提交评价</button>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const orderItems = ref([
  {
    id: 1,
    name: '新鲜蔬菜套装',
    spec: '5斤装',
    image: 'https://via.placeholder.com/100',
    rating: 5
  },
  {
    id: 2,
    name: '鸡蛋',
    spec: '10个装',
    image: 'https://via.placeholder.com/100',
    rating: 5
  }
]);

const serviceRating = ref(5);
const evaluationContent = ref('');
const uploadedImages = ref([]);

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - uploadedImages.value.length,
    success: (res) => {
      uploadedImages.value = [...uploadedImages.value, ...res.tempFilePaths];
    }
  });
};

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1);
};

const submitEvaluation = () => {
  uni.showToast({ title: '评价已提交', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
};
</script>

<style lang="scss">
.evaluation-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.section {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}

.product-item {
  display: flex;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 5rpx;
  margin-right: 20rpx;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5rpx;
  display: block;
}

.product-spec {
  font-size: 14px;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.rating {
  display: flex;
  gap: 10rpx;
}

.star {
  font-size: 24px;
  color: #ddd;
}

.star.active {
  color: #ffcc00;
}

.service-rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-label {
  font-size: 14px;
  color: #333;
}

.content {
  width: 100%;
  height: 150rpx;
  border: 1rpx solid #ddd;
  border-radius: 5rpx;
  padding: 15rpx;
  font-size: 14px;
  resize: none;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.uploaded-image {
  width: 120rpx;
  height: 120rpx;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 5rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 30rpx;
  height: 30rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border: 1rpx dashed #ddd;
  border-radius: 5rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.upload-icon {
  font-size: 30px;
  margin-bottom: 5rpx;
}

.upload-text {
  font-size: 12px;
}

.submit-btn {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 16px;
  font-weight: 500;
  margin-top: 30rpx;
}
</style>
```

**Step 5: 提交代码**

```bash
git add miniapp/pages.json miniapp/pages/order/refund.vue miniapp/pages/order/complaint.vue miniapp/pages/order/evaluation.vue
git commit -m "feat: add order operation pages"
```

## 任务4: 创建核心组件

**Files:**
- Create: `miniapp/components/delivery/schedule.vue`
- Create: `miniapp/components/order/status.vue`
- Create: `miniapp/components/delivery/track.vue`
- Create: `miniapp/components/order/actions.vue`

**Step 1: 创建配送班次选择组件**

```vue
<template>
  <view class="delivery-schedule">
    <view class="date-selector">
      <button @click="changeDate(-1)" class="date-btn">&lt;</button>
      <text class="current-date">{{ currentDate }}</text>
      <button @click="changeDate(1)" class="date-btn">&gt;</button>
    </view>
    <view class="schedule-list">
      <view v-for="schedule in schedules" :key="schedule.id" 
           :class="['schedule-item', { 'selected': selectedSchedule === schedule.id, 'disabled': schedule.status !== 'available' }]"
           @click="selectSchedule(schedule)"
      >
        <text class="schedule-time">{{ schedule.time }}</text>
        <text class="schedule-status">{{ schedule.status === 'available' ? '可预约' : schedule.status === 'full' ? '已满' : '已过期' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  schedules: {
    type: Array,
    default: () => []
  },
  defaultDate: {
    type: String,
    default: new Date().toISOString().split('T')[0]
  }
});

const emit = defineEmits(['select']);

const currentDate = ref(props.defaultDate);
const selectedSchedule = ref(null);

const changeDate = (delta) => {
  // 模拟日期变更
  currentDate.value = '2026-03-13';
  // 实际项目中应该根据delta计算新日期
};

const selectSchedule = (schedule) => {
  if (schedule.status === 'available') {
    selectedSchedule.value = schedule.id;
    emit('select', schedule);
  }
};
</script>

<style lang="scss" scoped>
.delivery-schedule {
  padding: 20rpx;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
}

.date-btn {
  background-color: #f5f5f5;
  border: none;
  padding: 10rpx 20rpx;
  border-radius: 5rpx;
  font-size: 16px;
}

.current-date {
  font-size: 16px;
  font-weight: 500;
}

.schedule-list {
  margin-bottom: 30rpx;
}

.schedule-item {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-item.selected {
  border: 2rpx solid #4CAF50;
  background-color: #f0f9ff;
}

.schedule-item.disabled {
  opacity: 0.6;
}

.schedule-time {
  font-size: 16px;
  font-weight: 500;
}

.schedule-status {
  font-size: 14px;
  color: #666;
}
</style>
```

**Step 2: 创建订单状态展示组件**

```vue
<template>
  <view class="order-status">
    <view class="status-item" :class="{ 'active': currentStatus >= 1 }">
      <view class="status-dot"></view>
      <text class="status-text">待支付</text>
    </view>
    <view class="status-line" :class="{ 'active': currentStatus >= 2 }"></view>
    <view class="status-item" :class="{ 'active': currentStatus >= 2 }">
      <view class="status-dot"></view>
      <text class="status-text">待配送</text>
    </view>
    <view class="status-line" :class="{ 'active': currentStatus >= 3 }"></view>
    <view class="status-item" :class="{ 'active': currentStatus >= 3 }">
      <view class="status-dot"></view>
      <text class="status-text">配送中</text>
    </view>
    <view class="status-line" :class="{ 'active': currentStatus >= 4 }"></view>
    <view class="status-item" :class="{ 'active': currentStatus >= 4 }">
      <view class="status-dot"></view>
      <text class="status-text">待收货</text>
    </view>
    <view class="status-line" :class="{ 'active': currentStatus >= 5 }"></view>
    <view class="status-item" :class="{ 'active': currentStatus >= 5 }">
      <view class="status-dot"></view>
      <text class="status-text">已完成</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'pending_payment'
  }
});

const statusMap = {
  'pending_payment': 1,
  'pending_delivery': 2,
  'delivering': 3,
  'pending_receipt': 4,
  'completed': 5,
  'cancelled': 0
};

const currentStatus = statusMap[props.status] || 0;
</script>

<style lang="scss" scoped>
.order-status {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.status-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #ddd;
  margin-bottom: 10rpx;
}

.status-text {
  font-size: 12px;
  color: #666;
}

.status-line {
  width: 40rpx;
  height: 2rpx;
  background-color: #ddd;
}

.status-item.active .status-dot {
  background-color: #4CAF50;
  box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.2);
}

.status-item.active .status-text {
  color: #4CAF50;
  font-weight: 500;
}

.status-line.active {
  background-color: #4CAF50;
}
</style>
```

**Step 3: 创建配送跟踪组件**

```vue
<template>
  <view class="delivery-track">
    <view class="track-item" :class="{ 'active': currentStep >= 1 }">
      <view class="track-dot"></view>
      <view class="track-content">
        <text class="track-title">订单已提交</text>
        <text class="track-time">{{ trackInfo.submittedTime }}</text>
      </view>
    </view>
    <view class="track-line" :class="{ 'active': currentStep >= 2 }"></view>
    <view class="track-item" :class="{ 'active': currentStep >= 2 }">
      <view class="track-dot"></view>
      <view class="track-content">
        <text class="track-title">商家已接单</text>
        <text class="track-time">{{ trackInfo.acceptedTime }}</text>
      </view>
    </view>
    <view class="track-line" :class="{ 'active': currentStep >= 3 }"></view>
    <view class="track-item" :class="{ 'active': currentStep >= 3 }">
      <view class="track-dot"></view>
      <view class="track-content">
        <text class="track-title">配送员已取货</text>
        <text class="track-time">{{ trackInfo.pickedTime }}</text>
      </view>
    </view>
    <view class="track-line" :class="{ 'active': currentStep >= 4 }"></view>
    <view class="track-item" :class="{ 'active': currentStep >= 4 }">
      <view class="track-dot"></view>
      <view class="track-content">
        <text class="track-title">配送中</text>
        <text class="track-time">{{ trackInfo.deliveringTime }}</text>
      </view>
    </view>
    <view class="track-line" :class="{ 'active': currentStep >= 5 }"></view>
    <view class="track-item" :class="{ 'active': currentStep >= 5 }">
      <view class="track-dot"></view>
      <view class="track-content">
        <text class="track-title">已送达</text>
        <text class="track-time">{{ trackInfo.deliveredTime }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'delivering'
  },
  trackInfo: {
    type: Object,
    default: () => ({
      submittedTime: '2026-03-11 10:00:00',
      acceptedTime: '2026-03-11 10:05:00',
      pickedTime: '2026-03-11 10:30:00',
      deliveringTime: '2026-03-11 10:45:00',
      deliveredTime: ''
    })
  }
});

const statusMap = {
  'pending_payment': 0,
  'pending_delivery': 1,
  'delivering': 3,
  'pending_receipt': 4,
  'completed': 5,
  'cancelled': 0
};

const currentStep = statusMap[props.status] || 0;
</script>

<style lang="scss" scoped>
.delivery-track {
  padding: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.track-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.track-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 20rpx;
  margin-top: 5rpx;
}

.track-content {
  flex: 1;
}

.track-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5rpx;
  display: block;
}

.track-time {
  font-size: 14px;
  color: #999;
}

.track-line {
  width: 2rpx;
  height: 40rpx;
  background-color: #ddd;
  margin-left: 9rpx;
  margin-bottom: 0;
}

.track-item.active .track-dot {
  background-color: #4CAF50;
  box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.2);
}

.track-item.active .track-title {
  color: #4CAF50;
}

.track-line.active {
  background-color: #4CAF50;
}

.track-item:last-child {
  margin-bottom: 0;
}

.track-line:last-child {
  display: none;
}
</style>
```

**Step 4: 创建订单操作按钮组件**

```vue
<template>
  <view class="order-actions">
    <button v-if="status === 'pending_payment'" @click="$emit('pay')" class="action-btn primary">立即支付</button>
    <button v-if="status === 'pending_delivery'" @click="$emit('cancel')" class="action-btn">取消订单</button>
    <button v-if="status === 'pending_delivery'" @click="$emit('contactMerchant')" class="action-btn primary">联系商家</button>
    <button v-if="status === 'delivering'" @click="$emit('contactDeliverer')" class="action-btn">联系配送员</button>
    <button v-if="status === 'delivering'" @click="$emit('track')" class="action-btn primary">查看配送</button>
    <button v-if="status === 'pending_receipt'" @click="$emit('confirm')" class="action-btn primary">确认收货</button>
    <button v-if="status === 'completed'" @click="$emit('refund')" class="action-btn">申请退款</button>
    <button v-if="status === 'completed'" @click="$emit('complain')" class="action-btn">投诉</button>
    <button v-if="status === 'completed'" @click="$emit('evaluate')" class="action-btn primary">评价</button>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'pending_payment'
  }
});

defineEmits(['pay', 'cancel', 'contactMerchant', 'contactDeliverer', 'track', 'confirm', 'refund', 'complain', 'evaluate']);
</script>

<style lang="scss" scoped>
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15rpx;
  margin-top: 30rpx;
  padding-bottom: 30rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 5rpx;
  font-size: 14px;
  background-color: #fff;
}

.action-btn.primary {
  background-color: #4CAF50;
  color: #fff;
  border: none;
}
</style>
```

**Step 5: 提交代码**

```bash
git add miniapp/components/delivery/schedule.vue miniapp/components/order/status.vue miniapp/components/delivery/track.vue miniapp/components/order/actions.vue
git commit -m "feat: add core components"
```

## 任务5: 实现状态管理

**Files:**
- Create: `miniapp/store/modules/delivery.js`
- Create: `miniapp/store/modules/order.js`
- Modify: `miniapp/store/index.js`

**Step 1: 创建配送状态管理模块**

```javascript
import { defineStore } from 'pinia';

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({
    schedules: [],
    currentBooking: null,
    deliveryTracks: {}
  }),
  getters: {
    getScheduleById: (state) => (id) => {
      return state.schedules.find(schedule => schedule.id === id);
    },
    getTrackByOrderId: (state) => (orderId) => {
      return state.deliveryTracks[orderId] || null;
    }
  },
  actions: {
    async fetchSchedules(date) {
      // 模拟API请求
      this.schedules = [
        { id: 1, time: '09:00-11:00', status: 'available' },
        { id: 2, time: '11:00-13:00', status: 'full' },
        { id: 3, time: '14:00-16:00', status: 'available' },
        { id: 4, time: '16:00-18:00', status: 'available' }
      ];
      return this.schedules;
    },
    setCurrentBooking(booking) {
      this.currentBooking = booking;
    },
    async bookSchedule(scheduleId, orderId) {
      // 模拟API请求
      this.currentBooking = {
        id: Date.now(),
        scheduleId,
        orderId,
        status: 'pending'
      };
      return this.currentBooking;
    },
    async getDeliveryTrack(orderId) {
      // 模拟API请求
      this.deliveryTracks[orderId] = {
        orderId,
        status: 'delivering',
        steps: [
          { status: 'submitted', time: '2026-03-11 10:00:00', description: '订单已提交' },
          { status: 'accepted', time: '2026-03-11 10:05:00', description: '商家已接单' },
          { status: 'picked', time: '2026-03-11 10:30:00', description: '配送员已取货' },
          { status: 'delivering', time: '2026-03-11 10:45:00', description: '配送中' }
        ]
      };
      return this.deliveryTracks[orderId];
    },
    async modifyBooking(bookingId, newScheduleId) {
      // 模拟API请求
      return { success: true, message: '预约修改成功' };
    }
  }
});
```

**Step 2: 创建订单状态管理模块**

```javascript
import { defineStore } from 'pinia';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    refundStatus: {},
    complaintStatus: {}
  }),
  getters: {
    getOrderById: (state) => (id) => {
      return state.orders.find(order => order.id === id);
    },
    getOrdersByStatus: (state) => (status) => {
      if (!status) return state.orders;
      return state.orders.filter(order => order.status === status);
    }
  },
  actions: {
    async fetchOrders(status) {
      // 模拟API请求
      this.orders = [
        {
          id: 1,
          orderId: '202603110001',
          status: 'delivering',
          statusText: '配送中',
          statusDesc: '您的订单正在配送中，请耐心等待',
          deliveryAddress: '北京市朝阳区建国路88号',
          deliveryTime: '2026-03-12 09:00-11:00',
          delivererName: '张师傅',
          delivererPhone: '138****1234',
          items: [
            {
              id: 1,
              name: '新鲜蔬菜套装',
              spec: '5斤装',
              price: 29.9,
              count: 1,
              image: 'https://via.placeholder.com/100'
            },
            {
              id: 2,
              name: '鸡蛋',
              spec: '10个装',
              price: 15.8,
              count: 2,
              image: 'https://via.placeholder.com/100'
            }
          ],
          totalPrice: 61.5,
          deliveryFee: 5,
          payAmount: 66.5,
          createTime: '2026-03-11 10:00:00',
          payTime: '2026-03-11 10:05:00'
        },
        {
          id: 2,
          orderId: '202603110002',
          status: 'completed',
          statusText: '已完成',
          statusDesc: '您的订单已完成，感谢您的购买',
          deliveryAddress: '北京市朝阳区建国路88号',
          deliveryTime: '2026-03-10 14:00-16:00',
          delivererName: '李师傅',
          delivererPhone: '139****5678',
          items: [
            {
              id: 3,
              name: '水果礼盒',
              spec: '10斤装',
              price: 99.9,
              count: 1,
              image: 'https://via.placeholder.com/100'
            }
          ],
          totalPrice: 99.9,
          deliveryFee: 5,
          payAmount: 104.9,
          createTime: '2026-03-10 09:00:00',
          payTime: '2026-03-10 09:05:00'
        }
      ];
      return this.orders;
    },
    async fetchOrderDetail(id) {
      // 模拟API请求
      this.currentOrder = {
        id: 1,
        orderId: '202603110001',
        status: 'delivering',
        statusText: '配送中',
        statusDesc: '您的订单正在配送中，请耐心等待',
        deliveryAddress: '北京市朝阳区建国路88号',
        deliveryTime: '2026-03-12 09:00-11:00',
        delivererName: '张师傅',
        delivererPhone: '138****1234',
        items: [
          {
            id: 1,
            name: '新鲜蔬菜套装',
            spec: '5斤装',
            price: 29.9,
            count: 1,
            image: 'https://via.placeholder.com/100'
          },
          {
            id: 2,
            name: '鸡蛋',
            spec: '10个装',
            price: 15.8,
            count: 2,
            image: 'https://via.placeholder.com/100'
          }
        ],
        totalPrice: 61.5,
        deliveryFee: 5,
        payAmount: 66.5,
        createTime: '2026-03-11 10:00:00',
        payTime: '2026-03-11 10:05:00'
      };
      return this.currentOrder;
    },
    async cancelOrder(id, reason) {
      // 模拟API请求
      const order = this.orders.find(o => o.id === id);
      if (order) {
        order.status = 'cancelled';
        order.statusText = '已取消';
        order.statusDesc = '您的订单已取消';
      }
      return { success: true, message: '订单已取消' };
    },
    async confirmReceipt(id) {
      // 模拟API请求
      const order = this.orders.find(o => o.id === id);
      if (order) {
        order.status = 'completed';
        order.statusText = '已完成';
        order.statusDesc = '您的订单已完成，感谢您的购买';
      }
      return { success: true, message: '收货成功' };
    },
    async applyRefund(id, data) {
      // 模拟API请求
      this.refundStatus[id] = {
        status: 'pending',
        message: '退款申请已提交，等待处理'
      };
      return { success: true, message: '退款申请已提交' };
    },
    async submitComplaint(id, data) {
      // 模拟API请求
      this.complaintStatus[id] = {
        status: 'pending',
        message: '投诉已提交，等待处理'
      };
      return { success: true, message: '投诉已提交' };
    },
    async submitEvaluation(id, data) {
      // 模拟API请求
      return { success: true, message: '评价已提交' };
    }
  }
});

**Step 3: 修改store/index.js**

```javascript
import { createPinia } from 'pinia';
import { useUserStore } from './modules/user';
import { useDeliveryStore } from './modules/delivery';
import { useOrderStore } from './modules/order';

const pinia = createPinia();

export {
  pinia,
  useUserStore,
  useDeliveryStore,
  useOrderStore
};
```

**Step 4: 提交代码**

```bash
git add miniapp/store/modules/delivery.js miniapp/store/modules/order.js miniapp/store/index.js
git commit -m "feat: add state management modules"
```

## 任务6: 集成API接口

**Files:**
- Create: `miniapp/api/delivery.js`
- Modify: `miniapp/api/order.js`

**Step 1: 创建配送相关API接口**

```javascript
import request from '@/utils/request';

export const deliveryApi = {
  // 获取配送班次列表
  getSchedules: (date) => {
    return request({
      url: '/api/delivery/schedules',
      method: 'GET',
      params: { date }
    });
  },
  // 预约配送班次
  bookSchedule: (data) => {
    return request({
      url: '/api/delivery/book',
      method: 'POST',
      data
    });
  },
  // 获取配送跟踪信息
  getDeliveryTrack: (orderId) => {
    return request({
      url: '/api/delivery/track',
      method: 'GET',
      params: { orderId }
    });
  },
  // 修改配送预约
  modifyBooking: (data) => {
    return request({
      url: '/api/delivery/modify',
      method: 'PUT',
      data
    });
  }
};
```

**Step 2: 修改订单相关API接口**

```javascript
import request from '@/utils/request';

export const orderApi = {
  // 获取订单列表
  getOrders: (status) => {
    return request({
      url: '/api/orders',
      method: 'GET',
      params: { status }
    });
  },
  // 获取订单详情
  getOrderDetail: (id) => {
    return request({
      url: `/api/orders/${id}`,
      method: 'GET'
    });
  },
  // 创建订单
  createOrder: (data) => {
    return request({
      url: '/api/orders',
      method: 'POST',
      data
    });
  },
  // 取消订单
  cancelOrder: (id, data) => {
    return request({
      url: `/api/orders/${id}/cancel`,
      method: 'POST',
      data
    });
  },
  // 确认收货
  confirmReceipt: (id) => {
    return request({
      url: `/api/orders/${id}/confirm`,
      method: 'POST'
    });
  },
  // 申请退款
  applyRefund: (id, data) => {
    return request({
      url: `/api/orders/${id}/refund`,
      method: 'POST',
      data
    });
  },
  // 提交投诉
  submitComplaint: (id, data) => {
    return request({
      url: `/api/orders/${id}/complaint`,
      method: 'POST',
      data
    });
  },
  // 评价订单
  submitEvaluation: (id, data) => {
    return request({
      url: `/api/orders/${id}/evaluate`,
      method: 'POST',
      data
    });
  },
  // 联系配送员
  contactDeliverer: (id) => {
    return request({
      url: `/api/orders/${id}/contact`,
      method: 'POST'
    });
  }
};
```

**Step 3: 提交代码**

```bash
git add miniapp/api/delivery.js miniapp/api/order.js
git commit -m "feat: add API interfaces"
```

## 任务7: 测试和优化

**Files:**
- No specific files, this is a testing and optimization task

**Step 1: 运行页面测试**

```bash
# 运行小程序开发工具
uni-app dev
```

**Step 2: 测试核心功能**

- 测试配送预约流程
- 测试订单管理功能
- 测试订单操作功能
- 测试配送跟踪功能

**Step 3: 性能优化**

- 图片懒加载
- 页面预加载
- 数据缓存
- 代码压缩

**Step 4: 兼容性测试**

- 测试不同微信版本
- 测试不同设备型号
- 测试不同网络环境

**Step 5: 提交测试结果**

```bash
git commit -m "test: complete testing and optimization"
```

## 结论

本实现计划详细描述了配送预约和订单管理功能的开发步骤，包括页面创建、组件开发、状态管理、API集成和测试优化。通过按照本计划实施，可以完成配送预约和订单管理功能的完整实现，为用户提供便捷的配送预约服务和完整的订单管理功能，提升用户体验和平台服务质量。