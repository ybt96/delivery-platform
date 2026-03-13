# 配送预约与订单管理功能设计文档

## 1. 功能概述

本设计文档基于混合式设计方案，实现配送预约和订单管理功能，包括：

- **配送预约**：用户在下单时选择固定班次，同时提供独立的配送管理页面
- **订单管理**：完整的订单操作功能，包括查看、取消、确认收货、申请退款、投诉反馈、配送跟踪、联系配送员、评价
- **配送跟踪**：实现配送状态更新，后续版本迭代实现实时定位

## 2. 页面结构设计

### 2.1 新增页面

| 页面路径 | 页面名称 | 功能描述 |
|---------|---------|----------|
| `pages/order/detail.vue` | 订单详情页 | 显示订单详细信息、配送状态、操作按钮 |
| `pages/delivery/index.vue` | 配送管理页 | 查看所有配送预约、修改预约、查看配送状态 |
| `pages/delivery/booking.vue` | 配送预约页 | 选择配送班次、查看配送时间 |
| `pages/order/refund.vue` | 退款申请页 | 提交退款申请、上传凭证 |
| `pages/order/complaint.vue` | 投诉反馈页 | 提交投诉、查看投诉处理状态 |
| `pages/order/evaluation.vue` | 订单评价页 | 对订单商品和服务进行评价 |

### 2.2 页面配置

需要在 `pages.json` 中添加以下页面配置：

```json
{
  "path": "pages/order/detail",
  "style": {
    "navigationBarTitleText": "订单详情"
  }
},
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
},
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

## 3. 组件设计

### 3.1 核心组件

| 组件名称 | 组件路径 | 功能描述 |
|---------|---------|----------|
| `DeliverySchedule.vue` | `components/delivery/schedule.vue` | 配送班次选择组件 |
| `OrderStatus.vue` | `components/order/status.vue` | 订单状态展示组件 |
| `DeliveryTrack.vue` | `components/delivery/track.vue` | 配送跟踪组件 |
| `OrderActions.vue` | `components/order/actions.vue` | 订单操作按钮组件 |
| `RefundForm.vue` | `components/order/refund-form.vue` | 退款申请表单组件 |
| `ComplaintForm.vue` | `components/order/complaint-form.vue` | 投诉反馈表单组件 |
| `EvaluationForm.vue` | `components/order/evaluation-form.vue` | 订单评价表单组件 |

### 3.2 组件设计要点

- **DeliverySchedule.vue**：
  - 展示可用的配送班次
  - 支持按日期选择
  - 显示班次状态（可预约、已满、已过期）
  - 选择班次后返回订单页面

- **OrderStatus.vue**：
  - 展示订单当前状态
  - 显示状态流转进度条
  - 根据订单状态显示不同的操作按钮

- **DeliveryTrack.vue**：
  - 显示配送状态（待配送、配送中、已送达）
  - 后续版本扩展实时定位功能
  - 显示配送时间节点

- **OrderActions.vue**：
  - 根据订单状态动态显示操作按钮
  - 支持取消订单、支付、联系配送员、确认收货、申请退款、投诉、评价等操作

## 4. 数据流程设计

### 4.1 配送预约流程

1. 用户进入商品详情页，选择商品规格和数量
2. 点击"立即购买"或"加入购物车"
3. 进入订单确认页，选择收货地址
4. 在订单确认页选择配送班次（调用 `DeliverySchedule` 组件）
5. 确认订单信息，选择支付方式
6. 提交订单，完成支付
7. 订单状态变为"待配送"

### 4.2 订单管理流程

1. 用户进入"我的订单"页面，查看所有订单
2. 点击订单进入订单详情页
3. 在订单详情页查看订单信息和配送状态
4. 根据订单状态进行相应操作：
   - 待支付：立即支付
   - 待配送：取消订单、联系商家
   - 配送中：联系配送员、查看配送状态
   - 待收货：确认收货
   - 已完成：申请退款、投诉、评价
   - 已取消：删除订单

### 4.3 配送管理流程

1. 用户进入"配送管理"页面
2. 查看所有配送预约记录
3. 点击预约记录查看详情
4. 可以修改未配送的预约时间
5. 查看配送状态和历史记录

## 5. API 接口设计

### 5.1 配送相关接口

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
|---------|------|----------|---------|----------|
| `/api/delivery/schedules` | GET | 获取配送班次列表 | `date` (可选) | 班次列表 |
| `/api/delivery/book` | POST | 预约配送班次 | `scheduleId`, `orderId` | 预约结果 |
| `/api/delivery/track` | GET | 获取配送跟踪信息 | `orderId` | 配送状态和轨迹 |
| `/api/delivery/modify` | PUT | 修改配送预约 | `bookingId`, `newScheduleId` | 修改结果 |

### 5.2 订单相关接口

| 接口路径 | 方法 | 功能描述 | 请求参数 | 响应数据 |
|---------|------|----------|---------|----------|
| `/api/orders` | GET | 获取订单列表 | `status` (可选) | 订单列表 |
| `/api/orders/:id` | GET | 获取订单详情 | `id` | 订单详情 |
| `/api/orders` | POST | 创建订单 | `addressId`, `items`, `scheduleId`, `paymentMethod` | 订单信息 |
| `/api/orders/:id/cancel` | POST | 取消订单 | `id`, `reason` | 取消结果 |
| `/api/orders/:id/confirm` | POST | 确认收货 | `id` | 确认结果 |
| `/api/orders/:id/refund` | POST | 申请退款 | `id`, `reason`, `amount`, `proof` | 退款申请结果 |
| `/api/orders/:id/complaint` | POST | 提交投诉 | `id`, `type`, `content`, `proof` | 投诉结果 |
| `/api/orders/:id/evaluate` | POST | 评价订单 | `id`, `score`, `content`, `images` | 评价结果 |
| `/api/orders/:id/contact` | POST | 联系配送员 | `id` | 联系信息 |

## 6. 状态管理设计

### 6.1 Pinia 状态模块

需要在 `store/modules/` 目录下新增以下状态模块：

- **delivery.js**：管理配送预约相关状态
  - `schedules`：配送班次列表
  - `currentBooking`：当前预约信息
  - `deliveryTracks`：配送跟踪信息
  - 相关操作方法

- **order.js**：管理订单相关状态
  - `orders`：订单列表
  - `currentOrder`：当前订单详情
  - `refundStatus`：退款状态
  - `complaintStatus`：投诉状态
  - 相关操作方法

### 6.2 状态管理流程

1. 用户选择配送班次时，更新 `delivery` 模块中的 `currentBooking` 状态
2. 下单时，将 `currentBooking` 信息传递给订单创建接口
3. 订单创建成功后，更新 `order` 模块中的 `orders` 状态
4. 查看订单详情时，从 `order` 模块中获取 `currentOrder` 状态
5. 配送状态更新时，通过 WebSocket 或轮询更新 `deliveryTracks` 状态

## 7. 性能优化策略

### 7.1 加载优化

- **配送班次缓存**：将获取的配送班次缓存到本地，减少重复请求
- **订单列表分页**：采用分页加载，避免一次性加载过多订单
- **图片懒加载**：订单详情中的商品图片采用懒加载

### 7.2 交互优化

- **骨架屏**：订单列表和详情页加载时显示骨架屏
- **防抖处理**：搜索和筛选操作添加防抖处理
- **预加载**：预加载可能访问的订单详情页面

### 7.3 数据优化

- **数据压缩**：API 响应数据进行压缩
- **按需获取**：订单详情页按需获取配送跟踪信息
- **本地存储**：常用数据存储到本地，减少网络请求

## 8. 兼容性与适配

### 8.1 微信小程序适配

- 确保所有功能在微信小程序中正常运行
- 处理小程序权限申请（如位置权限）
- 适配小程序的导航栏和底部安全区域

### 8.2 跨设备适配

- 适配不同尺寸的手机屏幕
- 确保在 iOS 和 Android 设备上表现一致
- 针对中老年人优化界面，使用大字体和高对比度

## 9. 测试计划

### 9.1 功能测试

- 配送预约流程测试
- 订单创建和管理测试
- 配送跟踪功能测试
- 订单操作功能测试（取消、确认收货、退款、投诉、评价）

### 9.2 性能测试

- 页面加载速度测试
- 响应时间测试
- 内存占用测试

### 9.3 兼容性测试

- 不同微信版本测试
- 不同设备型号测试
- 不同网络环境测试

## 10. 开发计划

### 10.1 开发步骤

1. **页面创建**：创建新增的页面文件
2. **组件开发**：开发核心组件
3. **API 集成**：集成后端 API 接口
4. **状态管理**：实现 Pinia 状态管理
5. **功能测试**：测试所有功能
6. **性能优化**：进行性能优化
7. **兼容性测试**：测试不同设备和环境

### 10.2 时间估计

- 页面和组件开发：3天
- API 集成和状态管理：2天
- 功能测试和优化：2天
- 总计：7天

## 11. 结论

本设计文档基于混合式设计方案，实现了配送预约和订单管理功能的完整设计，包括页面结构、组件设计、数据流程、API 接口、状态管理、性能优化等方面。通过本设计，可以为用户提供便捷的配送预约服务和完整的订单管理功能，提升用户体验和平台服务质量。