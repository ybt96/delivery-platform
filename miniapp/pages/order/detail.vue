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