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