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