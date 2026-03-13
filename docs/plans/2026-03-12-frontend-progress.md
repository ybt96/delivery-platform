# 前端开发进度文档

> 文档创建时间：2026-03-12
> 项目：乡里乡亲（乡村本地生活配送平台）
> 前端技术栈：Uni-app + Vue 3 Composition API + Pinia + SCSS

---

## 一、整体开发状态

| 阶段 | 内容 | 状态 | 完成时间 |
|------|------|------|----------|
| 基础架构 | 项目初始化、全局样式、工具函数、网络请求封装 | ✅ 已完成 | 2026-03-11 |
| 状态管理 | Pinia store 配置（user + cart） | ✅ 已完成 | 2026-03-11 |
| 通用组件 | Empty、ProductCard、SearchBar | ✅ 已完成 | 2026-03-11 |
| 用户认证模块 | 登录/注册页面 | ✅ 已完成 | 2026-03-11 |
| 首页模块 | 首页布局、Banner、分类入口、热门商品 | ✅ 已完成 | 2026-03-11 |
| 商品模块 | 商品列表、详情、搜索 | ✅ 已完成 | 2026-03-11 |
| 购物车模块 | 购物车页面、商品管理 | ✅ 已完成 | 2026-03-11 |
| 个人中心模块 | 个人中心、地址管理、个人信息编辑 | ✅ 已完成 | 2026-03-11 |
| 订单模块 | 订单确认、订单列表、订单详情 | ✅ 已完成 | 2026-03-12 |
| 百商联盟模块 | 联盟商家列表、优惠券中心 | ✅ 已完成 | 2026-03-12 |
| 顺风车模块 | 行程搜索、发布行程、行程详情、我的行程 | ✅ 已完成 | 2026-03-12 |

**当前总体进度：前端页面开发 100% 完成，首批 P0 联调兼容已完成，整体进入“联调与缺口收敛”阶段**

---

## 二、文件结构总览

```
miniapp/
├── package.json                      # 依赖配置
└── src/
    ├── App.vue                       # 应用入口，启动时恢复登录状态
    ├── main.js                       # createSSRApp + Pinia 注册
    ├── manifest.json                 # 小程序配置（AppID: wx215d18e57b509241）
    ├── pages.json                    # 19个页面路由 + 4个TabBar
    ├── uni.scss                      # uni-app 全局 scss 变量
    │
    ├── api/                          # API 接口层（5个模块）
    │   ├── auth.js                   # 认证：wxLogin / phoneLogin / sendCode
    │   ├── product.js                # 商品：getProducts / getProductDetail / search
    │   ├── order.js                  # 订单：createOrder / getOrders / cancelOrder
    │   ├── alliance.js               # 联盟：getMerchants / getCoupons / claimCoupon
    │   └── carpool.js                # 顺风车：getTrips / publishTrip / bookTrip
    │
    ├── common/
    │   └── config.js                 # 全局配置（API baseUrl 等）
    │
    ├── components/common/            # 通用组件（easycom 自动注册）
    │   ├── Empty.vue                 # 空状态组件
    │   ├── ProductCard.vue           # 商品卡片
    │   └── SearchBar.vue             # 搜索框
    │
    ├── pages/                        # 业务页面
    │   ├── auth/
    │   │   └── login.vue             # 登录（微信一键 + 短信验证码）
    │   ├── home/
    │   │   └── index.vue             # 首页（Banner + 快捷导航 + 热门商品）
    │   ├── product/
    │   │   ├── list.vue              # 商品列表（分类Tab + 排序 + 无限滚动）
    │   │   ├── detail.vue            # 商品详情（规格选择 + 加购 + 立即购买）
    │   │   └── search.vue            # 搜索（历史 + 热搜 + 结果）
    │   ├── cart/
    │   │   └── index.vue             # 购物车（按店分组 + 结算）
    │   ├── order/
    │   │   ├── confirm.vue           # 订单确认（地址 + 备注 + 金额明细）
    │   │   ├── list.vue              # 订单列表（按状态Tab）
    │   │   └── detail.vue            # 订单详情（配送追踪 + 操作按钮）
    │   ├── user/
    │   │   ├── index.vue             # 个人中心（订单入口 + 角色入口 + 服务菜单）
    │   │   ├── profile.vue           # 个人信息（头像 + 昵称 + 手机绑定）
    │   │   ├── address-list.vue      # 收货地址列表（支持选择模式）
    │   │   └── address-edit.vue      # 地址编辑（省市区 + 标签 + 表单验证）
    │   ├── alliance/
    │   │   ├── index.vue             # 百商联盟（商家列表 + 分类过滤）
    │   │   └── coupons.vue           # 优惠券（领券中心 + 我的券包双Tab）
    │   └── carpool/
    │       ├── index.vue             # 顺风车首页（路线搜索 + 行程列表）
    │       ├── publish.vue           # 发布行程（路线 + 时间 + 座位 + 价格）
    │       ├── detail.vue            # 行程详情（司机信息 + 座位预约）
    │       └── my-trips.vue          # 我的行程（乘客预约 / 司机发布 双视角）
    │
    ├── store/
    │   ├── index.js                  # Pinia 实例 + pinia-plugin-persistedstate
    │   └── modules/
    │       ├── user.js               # 用户 store（token + userInfo + addresses）
    │       └── cart.js               # 购物车 store（items + 计算属性 + 操作）
    │
    ├── styles/
    │   ├── variables.scss            # 设计令牌（颜色/间距/字号/圆角）
    │   ├── mixins.scss               # SCSS 混入（flex/card/ellipsis/btn/safe-bottom）
    │   └── global.scss               # 全局重置样式
    │
    └── utils/
        ├── request.js                # uni.request 封装（token注入 + 错误处理）
        ├── storage.js                # 本地存储工具
        └── validate.js               # 表单验证工具
```

---

## 三、各模块详细说明

### 3.1 基础架构

#### 网络请求封装（`utils/request.js`）
- 基于 `uni.request` 封装，支持 Promise
- 请求拦截：自动注入 `Authorization: Bearer <token>`
- 响应拦截：统一处理 401（自动跳转登录）、业务错误码
- 错误兜底：网络超时、服务器错误统一 `uni.showToast` 提示

#### 状态管理（`store/`）
- **user store**：持久化 key `xlxq_user`，存储 token、userInfo（含角色列表）、addresses
  - getter：`isLoggedIn`、`defaultAddress`、`hasRole(role)`
- **cart store**：持久化 key `xlxq_cart`，存储商品列表
  - getter：`totalCount`（角标数量）、`selectedAmount`（选中金额）、`selectedItems`

#### 全局样式设计令牌
```scss
$primary-color: #4CAF50;      // 品牌绿（按钮/主色）
$secondary-color: #FF9800;    // 强调橙（标签/角标）
$price-color: #ff4d4f;        // 价格红
$bg-color: #f5f5f5;           // 页面背景
$text-primary: #333333;       // 主文字
$text-secondary: #666666;     // 次文字
$text-placeholder: #999999;   // 占位文字
```

---

### 3.2 用户认证模块

**文件**：`pages/auth/login.vue`

**功能**：
- 微信一键登录（调用 `uni.login` 获取 code，后端换取 token）
- 手机号 + 短信验证码登录（60秒倒计时）
- 登录成功后恢复购物车状态，跳转前序页面

---

### 3.3 首页模块

**文件**：`pages/home/index.vue`

**功能**：
- 自定义导航栏（搜索框 + 消息图标）
- Banner 轮播图（`uni.navigateTo` 跳转）
- 快捷功能入口（6宫格：百货、联盟、顺风车、配送等）
- 营销区块（满减/新人券）
- 热门商品列表（`ProductCard` 组件，下拉刷新 + 上滑加载更多）

---

### 3.4 商品模块

**文件**：`pages/product/list.vue`、`detail.vue`、`search.vue`

**list.vue 功能**：
- 顶部分类 Tab 横向滚动
- 综合/销量/价格排序切换
- `scroll-view` 无限滚动加载
- `ProductCard` 展示，点击进详情

**detail.vue 功能**：
- 商品图片轮播（`swiper` 组件）
- 商品基本信息（价格/销量/运费）
- 规格选择弹层（bottom-sheet 样式，单选规格组）
- 加入购物车 / 立即购买双操作
- 商家信息卡片

**search.vue 功能**：
- 搜索历史（最近10条，支持清空）
- 热搜词标签云
- 搜索结果列表（排序 + 无限滚动）

---

### 3.5 购物车模块

**文件**：`pages/cart/index.vue`

**功能**：
- 按商家分组展示（`v-for` 嵌套）
- 全选 / 店铺选 / 单品选三级选择
- 数量加减（最小1，最大库存）
- 右滑删除（编辑模式）
- 底部结算栏（选中件数 + 金额 + 去结算按钮）

---

### 3.6 订单模块

**文件**：`pages/order/confirm.vue`、`list.vue`、`detail.vue`

**confirm.vue 功能**：
- 收货地址选择（跳转地址列表页，`uni.$on` 接收回调）
- 商品按商家分组展示 + 备注输入
- 优惠券选择（占位）
- 金额明细（商品 + 运费 - 优惠 = 实付）
- 提交订单，跳转支付（模拟）

**list.vue 功能**：
- 状态 Tab：全部 / 待付款 / 待发货 / 待收货 / 已完成
- 订单卡片：商品缩略、金额、状态操作按钮
  - 待付款：去支付 / 取消
  - 待收货：确认收货
  - 已完成：评价

**detail.vue 功能**：
- 状态大图标 + 进度说明
- 配送追踪（配送员信息 + 位置更新时间）
- 商品列表 + 金额明细
- 订单基本信息（单号/时间/支付方式）
- 操作按钮（取消/再次购买/申请退款）

---

### 3.7 个人中心模块

**文件**：`pages/user/index.vue`、`profile.vue`、`address-list.vue`、`address-edit.vue`

**index.vue 功能**：
- 用户头像 + 昵称 + 手机号
- 订单快捷入口（4类状态）
- 服务菜单（地址/优惠券/顺风车/帮助）
- 角色专属入口（商家后台 / 配送员 / 站长 / 管理员，用 `hasRole` 控制）

**profile.vue 功能**：
- 头像点击上传（`uni.chooseImage`）
- 昵称弹层编辑
- 手机号绑定/更换（验证码流程）

**address-list.vue 功能**：
- 地址卡片列表（默认地址置顶）
- 支持"选择模式"：从订单确认页跳转时，点击地址直接回传
- 编辑 / 删除 / 设为默认

**address-edit.vue 功能**：
- 姓名 + 手机号（validate.js 验证）
- 省市区三级联动（`uni.navigateTo` 地区选择器）
- 地址标签（家/公司/学校/其他）
- 是否设为默认开关

---

### 3.8 百商联盟模块

**文件**：`pages/alliance/index.vue`、`coupons.vue`

**index.vue 功能**：
- 顶部分类过滤 Tab（全部/餐饮/超市/服务…）
- 商家卡片列表（头像/名称/评分/优惠标签）
- 点击进入商家主页（跳商品列表，附 shopId 参数）

**coupons.vue 功能**：
- 两 Tab：领券中心 / 我的券包
- 优惠券卡片（面额/门槛/有效期/适用商家）

---

## 四、2026-03-13 联调进展补充

### 4.1 本轮联调结论

当前阶段建议：先以“前端兼容后端现状返回结构”为主，优先打通首页商品、订单列表、服务站 3 条 P0 链路，再逐步反推 API 契约统一。
长期演进建议：后续应将商品、订单、服务站接口统一为一致的分页与响应结构，减少页面层兼容逻辑。

本轮已完成的前端联调修正：
- 统一请求基础地址到运行中的后端服务：[`miniapp/src/utils/request.js`](miniapp/src/utils/request.js:3)
- 商品列表兼容后端 [`[list, count]`](backend/src/modules/products/products.service.ts:32) 返回：[`miniapp/src/pages/product/list.vue`](miniapp/src/pages/product/list.vue:176)
- 首页热门商品兼容后端 [`[list, count]`](backend/src/modules/products/products.service.ts:32) 返回：[`miniapp/src/pages/home/index.vue`](miniapp/src/pages/home/index.vue:140)
- 订单列表改为对接后端实际分页参数 [`skip/take`](backend/src/modules/orders/orders.controller.ts:39)，并兼容数值状态：[`miniapp/src/pages/order/list.vue`](miniapp/src/pages/order/list.vue:119)
- 服务站列表 / 详情 / 代购订单兼容后端 `{ code, data }` 嵌套结构：[`miniapp/src/store/modules/station.js`](miniapp/src/store/modules/station.js:38)

### 4.2 已验证项

已通过代码检查验证：
- 请求基地址已切换为 `http://localhost:3005`
  证据：[`miniapp/src/utils/request.js`](miniapp/src/utils/request.js:3)
- 商品列表已按数组返回结构取值
  证据：[`miniapp/src/pages/product/list.vue`](miniapp/src/pages/product/list.vue:176)
- 首页热门商品已按 `skip/take` 拉取并兼容数组返回
  证据：[`miniapp/src/pages/home/index.vue`](miniapp/src/pages/home/index.vue:140)
- 订单列表已引入 tab 状态映射并改为 `skip/take`
  证据：[`miniapp/src/pages/order/list.vue`](miniapp/src/pages/order/list.vue:119)
- 服务站 store 已兼容 `res.data`
  证据：[`miniapp/src/store/modules/station.js`](miniapp/src/store/modules/station.js:41)

已通过接口探测验证：
- 商品接口可访问，当前返回：`{"code":200,"message":"success","data":[[],0],...}`
- 服务站 nearby 接口可访问，当前返回：`{"code":200,"message":"success","data":{"code":200,"data":[]},...}`
- 订单接口需要登录态，未带 token 时返回 401：`{"message":"未提供认证token","error":"Unauthorized","statusCode":401}`

已通过小程序构建验证：
- 小程序开发构建持续成功
  证据：终端输出 `DONE Build complete. Watching for changes...`

### 4.3 未验证项

以下内容当前仅完成代码层对齐，尚未完成真实业务闭环验证：
- 登录态下的“我的订单”真实列表展示是否正常
- 首页 / 商品列表是否已成功展示真实商品数据（当前后端返回为空数组）
- 服务站详情页、代购订单页是否在真实数据下正常展示
- 订单评价页提交是否可真正落库（当前前端已补页，但后端正式评价接口尚未确认）
- 商品搜索接口稳定性（此前探测 `/api/v1/products/search` 返回过 500，尚未完成后端定位）

### 4.4 当前风险点

- 商品、订单、服务站三类接口返回风格不一致，导致前端页面层存在兼容代码
- 后端测试数据不足，当前商品列表接口返回空数组，无法完成完整 UI 验证
- 订单接口依赖登录 token，若登录链路未先打通，将阻塞订单联调闭环
- 商品搜索接口存在潜在后端异常，可能影响搜索页继续联调

### 4.5 下一步执行计划

#### D1：登录态与订单链路验证
交付物：
- 验证登录获取 token 是否可用
- 真实调用“我的订单”接口
- 记录订单状态值与页面 Tab 映射结果

#### D1：商品与首页数据验证
交付物：
- 核实商品列表为空是数据问题还是查询条件问题
- 若缺测试数据，补最小种子数据
- 验证首页热门商品展示闭环

#### D2：服务站链路验证
交付物：
- 验证 nearby / detail / purchase-orders 真实展示
- 补充空态、异常态提示
- 确认站长入口跳转流程可达

#### D2：契约统一整理
交付物：
- 输出前后端接口差异清单
- 明确哪些兼容逻辑保留在前端，哪些应改回后端统一
- 形成下一轮接口收敛任务单

### 4.6 回滚思路

- 若联调后发现 3005 并非目标环境，可将请求基地址回滚为环境变量控制，不保留硬编码默认值
- 若后端后续统一接口结构，可逐步删除页面层 `Array.isArray(res)` 与 `res.data || res.list` 兼容分支
- 如订单状态定义调整，应优先修改 [`tabStatusMap`](miniapp/src/pages/order/list.vue:119) 与 [`statusMap`](miniapp/src/pages/order/list.vue:104) 映射层，避免扩散到页面模板

### 4.7 当前阶段结论

当前阶段建议：小程序“缺页面”类问题已基本收敛，现阶段主要阻塞点已从 UI 开发转为“登录态、测试数据、接口契约统一”。
长期演进建议：后续应把分页结构、业务状态枚举、接口响应包裹层统一到后端网关/控制器规范，前端只保留最薄适配层。
- 领取操作（登录拦截 + 重复领取提示）
- 我的券包按状态展示（未用/已用/已过期）

---

### 3.9 顺风车模块

**文件**：`pages/carpool/index.vue`、`publish.vue`、`detail.vue`、`my-trips.vue`

**index.vue 功能**：
- 出发地 / 目的地选择器（ActionSheet 快选）
- 出发日期选择（uni `picker` 组件，30天范围）
- 搜索行程按钮
- 快捷操作入口（发布行程 / 我的行程）
- 附近行程列表（司机头像/路线/时间/剩余座位/价格）

**publish.vue 功能**：
- 路线选择（出发地 / 目的地 / 互换按钮）
- 多列时间选择器（日期 + 时 + 分）
- 座位数量步进（1-6，+/- 控制）
- 价格输入（每人分摊费用）
- 行程描述文本域
- 表单验证 + 提交

**detail.vue 功能**：
- 行程路线卡（出发地/目的地/距离/时长）
- 司机信息（头像/评分/出行次数/实名认证标签/车牌）
- 行程说明 + 预约须知
- 底部固定预约栏（价格 + 座位数步进 + 立即预约按钮）
- 预约成功弹窗（出发时间/集合地点提示）
- 实名认证前置拦截

**my-trips.vue 功能**：
- 乘客视角 / 司机视角双 Tab 切换
- 乘客：我的预约列表（预约单号/路线/时间/状态/取消操作）
- 司机：我发布的行程（行程/剩余座位/预约人数/取消操作）
- 下拉刷新 + 上滑加载更多
- 司机视角底部固定"发布行程"按钮

---

## 四、路由注册清单

共注册 **19 个页面**，TabBar 4 个：

| 页面路径 | 标题 | 类型 |
|----------|------|------|
| `pages/home/index` | 乡里乡亲 | TabBar（自定义导航） |
| `pages/product/list` | 商品列表 | TabBar |
| `pages/cart/index` | 购物车 | TabBar |
| `pages/user/index` | 我的 | TabBar |
| `pages/auth/login` | 登录 | 普通页（自定义导航） |
| `pages/product/detail` | 商品详情 | 普通页 |
| `pages/product/search` | 搜索商品 | 普通页 |
| `pages/order/confirm` | 确认订单 | 普通页 |
| `pages/order/list` | 我的订单 | 普通页 |
| `pages/order/detail` | 订单详情 | 普通页 |
| `pages/user/address-list` | 收货地址 | 普通页 |
| `pages/user/address-edit` | 编辑地址 | 普通页 |
| `pages/user/profile` | 个人信息 | 普通页 |
| `pages/carpool/index` | 乡村顺风车 | 普通页 |
| `pages/carpool/publish` | 发布行程 | 普通页 |
| `pages/carpool/detail` | 行程详情 | 普通页 |
| `pages/carpool/my-trips` | 我的行程 | 普通页 |
| `pages/alliance/index` | 百商联盟 | 普通页 |
| `pages/alliance/coupons` | 优惠券中心 | 普通页 |

---

## 五、API 接口对照表

| 模块 | 方法 | HTTP | 路径 |
|------|------|------|------|
| 认证 | `wxLogin` | POST | `/auth/wx-login` |
| 认证 | `phoneLogin` | POST | `/auth/login` |
| 认证 | `sendCode` | POST | `/auth/send-code` |
| 认证 | `getUserInfo` | GET | `/user/info` |
| 认证 | `updateUserInfo` | PUT | `/user/info` |
| 商品 | `getProducts` | GET | `/products` |
| 商品 | `getProductDetail` | GET | `/products/:id` |
| 商品 | `getCategories` | GET | `/products/categories` |
| 商品 | `searchProducts` | GET | `/products/search` |
| 商品 | `getHotProducts` | GET | `/products/hot` |
| 订单 | `createOrder` | POST | `/orders` |
| 订单 | `getOrders` | GET | `/orders` |
| 订单 | `getOrderDetail` | GET | `/orders/:id` |
| 订单 | `cancelOrder` | POST | `/orders/:id/cancel` |
| 订单 | `confirmOrder` | POST | `/orders/:id/confirm` |
| 订单 | `refundOrder` | POST | `/orders/:id/refund` |
| 订单 | `getDeliveryTrack` | GET | `/orders/:id/track` |
| 联盟 | `getAllianceMerchants` | GET | `/alliance/merchants` |
| 联盟 | `getCoupons` | GET | `/alliance/coupons` |
| 联盟 | `claimCoupon` | POST | `/alliance/coupons/:id/claim` |
| 联盟 | `getMyCoupons` | GET | `/alliance/coupons/mine` |
| 顺风车 | `getCarpoolTrips` | GET | `/carpool/trips` |
| 顺风车 | `getCarpoolTripDetail` | GET | `/carpool/trips/:id` |
| 顺风车 | `publishTrip` | POST | `/carpool/trips` |
| 顺风车 | `bookTrip` | POST | `/carpool/trips/:id/book` |
| 顺风车 | `cancelBooking` | POST | `/carpool/bookings/:id/cancel` |
| 顺风车 | `getMyTrips` | GET | `/carpool/trips/mine` |

---

## 六、待办与下一步工作

### 6.1 前端待完善项（优先级排序）

| 优先级 | 事项 | 说明 |
|--------|------|------|
| P0 | 与后端 API 联调 | 替换首页/商品/订单/联盟/顺风车中的模拟数据与兜底逻辑 |
| P0 | 微信支付集成 | 在 `pages/order/confirm.vue` 中接入 `uni.requestPayment` |
| P0 | 用户中心入口收敛 | 避免跳转未注册页面；未完成功能提供可达替代路径（2026-03-13 已完成首轮） |
| P0 | 服务站 API 对齐 | `station` 模块接口前缀与后端 `/api/v1/stations` 保持一致（2026-03-13 已完成首轮） |
| P1 | 实名认证页面 | `pages/user/certify.vue`，顺风车/角色申请前置校验依赖该页 |
| P1 | 商家入驻页面 | `pages/merchant/apply.vue`，对应 PRD 中商家/角色申请流程 |
| P1 | 消息通知页 | `pages/user/messages.vue`，承接订单、顺风车、系统公告通知 |
| P1 | 图片资源补充 | 添加真实 Banner 图、商品占位图、空状态插画 |
| P2 | 评价模块完善 | `pages/order/review.vue` 已新增；后续需补评价列表展示、后端提交接口与图片上传 |
| P2 | 性能优化 | 图片懒加载、列表虚拟化、请求防抖 |
| P3 | 骨架屏 | 各页面加载中骨架屏组件 |
| P3 | 错误边界 | 全局错误捕获页面 |

### 6.2 联调准备清单

后端需要提供以下接口供前端联调：

- [ ] 用户登录相关（微信 code 换 token、手机验证码）
- [ ] 商品列表分页（支持分类、排序、搜索关键词参数）
- [ ] 购物车 CRUD（因前端当前使用本地 Pinia 管理，需确认是否同步服务端）
- [ ] 订单创建 + 支付回调
- [ ] 地址 CRUD（当前地址保存在本地 store，需与后端同步）
- [ ] 顺风车行程 CRUD + 预约流程
- [ ] 优惠券领取 + 核销

### 6.3 2026-03-13 盘点结论与本轮补齐

**已发现遗漏/风险点：**
- 用户中心存在跳往未注册页面的入口（钱包、积分、收藏、设置），会造成不可达流程
- 订单列表存在“去评价”入口，但缺少实际页面与路由注册
- 服务站 API 使用 `/api/v1/station`，与后端 `StationController` 的 `/api/v1/stations` 不一致
- 服务站模块虽已有页面，但首页/个人中心尚未形成强入口矩阵
- 多处页面仍依赖模拟数据或失败兜底，联调后需逐页收敛

**本轮已补齐：**
- 新增 `pages/order/review.vue` 评价页，并接通订单列表跳转
- 在 `pages.json` 中注册 `pages/order/review`
- 修正 `src/api/station.js` 到后端实际前缀 `/api/v1/stations`
- 调整个人中心入口策略：未开发能力改为可达替代路径，站长入口直达“我的代购”

### 6.4 分阶段完善计划（可本周落地）

| 阶段 | 时间 | 目标 | 交付物 |
|------|------|------|--------|
| D1 | 2026-03-13 | 盘点缺口并完成首轮阻断项修复 | 评价页、服务站 API 修正、用户中心入口收敛 |
| D2-D3 | 2026-03-14 ~ 2026-03-15 | 联调 P0 页面与接口 | 首页/商品/订单/服务站联调记录、问题清单 |
| W1 | 2026-03-16 ~ 2026-03-20 | 补齐用户体系 P1 页面 | 实名认证页、消息通知页、角色申请入口 |
| W2 | 2026-03-23 ~ 2026-03-27 | 完善商家与评价闭环 | 商家入驻页、评价展示、图片上传/提交接口联调 |

### 6.5 风险点与回滚思路

**风险点：**
- 后端尚未提供部分接口时，前端新增流程可能只能做到页面闭环，无法做到真实业务闭环
- 服务站附近列表依赖定位参数，若定位未接入，列表可能为空
- 评价接口当前前端按通用提交结构预埋，仍需与后端字段确认

**回滚思路：**
- 若联调发现新评价页接口未兼容，可临时回退为只读占位页，不影响订单主流程
- 若服务站接口返回结构与预期不一致，可先在 `station store` 中做兼容映射，不大改页面层
- 用户中心替代跳转均为低风险改动，可按入口逐个恢复到正式页面

### 6.6 测试重点

- 登录态失效时的自动跳转及状态清理
- 购物车数据持久化（kill 小程序后重启数据恢复）
- 订单确认页地址选择跨页通信（`uni.$emit`/`uni.$on`）
- 顺风车预约实名拦截流程
- 多角色用户（同时是司机+消费者）个人中心入口显示
- 订单评价页提交与返回详情页流程
- 服务站接口前缀修正后列表/详情/代购页面联通性

---

## 七、启动与构建

### 开发环境

```bash
cd miniapp
npm install
npm run dev:mp-weixin    # 编译微信小程序，导入到微信开发者工具
npm run dev:h5           # H5 预览（仅调试用，生产以小程序为准）
```

### 生产构建

```bash
npm run build:mp-weixin  # 构建微信小程序发布包
```

### 环境配置

编辑 `miniapp/src/common/config.js`，修改 `baseUrl` 为实际后端地址：

```js
// 开发环境
export const BASE_URL = 'http://localhost:3000/api'
// 生产环境
// export const BASE_URL = 'https://api.xlxq.com/api'
```

---

*文档维护者：前端开发团队*
*最后更新：2026-03-13*