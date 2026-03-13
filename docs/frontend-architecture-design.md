# 地方特色局域网络物资配送平台 - 前端架构设计

## 1. 概述

基于PRD文档和重新设计的系统架构，制定前端架构方案，支持六大核心模块：
1. 用户体系
2. 本地百货广场
3. 配送预约服务
4. 百商联盟
5. 乡村顺风车
6. 社区服务站（代购代办）

## 2. 技术选型

### 2.1 主要框架
- **Uni-app**：基于Vue3，支持一套代码编译到多端（微信小程序、H5、App）
- **TypeScript**：强类型语言，提升代码质量和开发效率
- **uView UI**：适合移动端的UI组件库

### 2.2 状态管理
- **Pinia**：Vue3官方推荐的状态管理库，替代Vuex

### 2.3 网络请求
- **axios**：Promise-based HTTP client
- **拦截器**：统一处理请求/响应、token刷新、错误处理

### 2.4 路由管理
- **uni-app内置路由**：基于pages.json配置页面路由

### 2.5 地图服务
- **腾讯地图API**：用于位置选择、路线规划、距离计算

## 3. 项目结构设计

```
src/
├── api/                  # 接口请求层
│   ├── auth.js           # 认证相关接口
│   ├── user.js           # 用户相关接口
│   ├── product.js        # 商品相关接口
│   ├── merchant.js       # 商家相关接口
│   ├── order.js          # 订单相关接口
│   ├── delivery.js       # 配送相关接口
│   ├── alliance.js       # 联盟相关接口
│   ├── carpool.js        # 顺风车相关接口
│   └── station.js        # 服务站相关接口
├── components/           # 公共组件
│   ├── common/           # 通用组件
│   ├── business/         # 业务组件
│   └── layout/           # 布局组件
├── pages/                # 页面目录
│   ├── index/            # 首页模块
│   ├── category/         # 分类模块
│   ├── product/          # 商品模块
│   ├── cart/             # 购物车模块
│   ├── order/            # 订单模块
│   ├── user/             # 用户模块
│   ├── merchant/         # 商家模块
│   ├── alliance/         # 联盟模块
│   ├── carpool/          # 顺风车模块
│   ├── station/          # 服务站模块
│   └── auth/             # 认证模块
├── store/                # 状态管理
│   ├── modules/          # 模块化状态
│   │   ├── user.js       # 用户状态
│   │   ├── cart.js       # 购物车状态
│   │   ├── order.js      # 订单状态
│   │   └── app.js        # 应用状态
│   └── index.js          # 状态入口
├── utils/                # 工具函数
│   ├── request.js        # 请求封装
│   ├── auth.js           # 认证工具
│   ├── validate.js       # 表单验证
│   ├── format.js         # 数据格式化
│   └── map.js            # 地图工具
├── styles/               # 样式文件
│   ├── variables.scss    # 全局变量
│   ├── mixins.scss       # 混合样式
│   └── common.scss       # 公共样式
├── static/               # 静态资源
└── App.vue               # 根组件
```

## 4. 核心模块设计

### 4.1 用户体系模块

#### 4.1.1 页面设计
1. **登录/注册页** (`pages/auth/login.vue`)
   - 手机号输入
   - 验证码获取与验证
   - 微信一键登录
   - 用户协议展示

2. **个人中心页** (`pages/user/index.vue`)
   - 用户基本信息展示
   - 角色切换入口
   - 订单快捷入口
   - 地址管理入口
   - 优惠券入口
   - 设置入口

3. **地址管理页** (`pages/user/address.vue`)
   - 地址列表展示
   - 新增/编辑地址
   - 地图选址功能
   - 设为默认地址

4. **角色申请页** (`pages/user/apply-role.vue`)
   - 商家/配送员/车主/站长申请
   - 资料填写与上传
   - 申请状态查看

#### 4.1.2 状态设计 (store/modules/user.js)
```javascript
{
  state: {
    token: '',
    userInfo: {},
    roles: [],
    addresses: [],
    defaultAddress: {}
  },
  actions: {
    login,
    logout,
    getUserInfo,
    updateUserInfo,
    getAddressList,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
}
```

### 4.2 本地百货广场模块

#### 4.2.1 页面设计
1. **首页** (`pages/index/index.vue`)
   - 轮播图展示
   - 分类快捷入口
   - 热门推荐商品
   - 联盟优惠专区

2. **分类页** (`pages/category/index.vue`)
   - 商品分类列表
   - 子分类展示
   - 筛选功能

3. **商品列表页** (`pages/product/list.vue`)
   - 商品搜索
   - 筛选排序
   - 商品瀑布流展示

4. **商品详情页** (`pages/product/detail.vue`)
   - 商品图片轮播
   - 价格与规格展示
   - 商家信息
   - 商品评价
   - 加入购物车/立即购买

5. **商家主页** (`pages/merchant/detail.vue`)
   - 商家基本信息
   - 商品列表展示
   - 商家评价
   - 联系商家

#### 4.2.2 状态设计 (store/modules/product.js)
```javascript
{
  state: {
    categories: [],
    products: [],
    productDetail: {},
    merchantDetail: {},
    searchHistory: []
  },
  actions: {
    getCategories,
    getProducts,
    getProductDetail,
    getMerchantDetail,
    searchProducts,
    addSearchHistory,
    clearSearchHistory
  }
}
```

### 4.3 配送预约服务模块

#### 4.3.1 页面设计
1. **购物车页** (`pages/cart/index.vue`)
   - 商品列表展示
   - 数量修改
   - 选择商家
   - 结算入口

2. **确认订单页** (`pages/order/confirm.vue`)
   - 收货地址选择
   - 商品清单展示
   - 配送方式选择
   - 优惠券选择
   - 费用明细计算

3. **支付页** (`pages/order/pay.vue`)
   - 支付方式选择
   - 微信支付集成
   - 支付结果展示

4. **订单列表页** (`pages/order/list.vue`)
   - 订单状态筛选
   - 订单列表展示
   - 订单操作入口

5. **订单详情页** (`pages/order/detail.vue`)
   - 订单详细信息
   - 配送状态跟踪
   - 订单操作（取消、确认收货等）

#### 4.3.2 状态设计 (store/modules/order.js)
```javascript
{
  state: {
    cart: [],
    orders: [],
    orderDetail: {},
    currentOrder: {}
  },
  actions: {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getOrders,
    getOrderDetail,
    createOrder,
    cancelOrder,
    confirmReceipt
  }
}
```

### 4.4 百商联盟模块

#### 4.4.1 页面设计
1. **联盟首页** (`pages/alliance/index.vue`)
   - 联盟商家展示
   - 优惠券专区
   - 联盟活动展示

2. **联盟商家列表** (`pages/alliance/merchants.vue`)
   - 商家分类筛选
   - 商家列表展示
   - 商家详情入口

3. **优惠券中心** (`pages/alliance/coupons.vue`)
   - 可领取优惠券
   - 已领取优惠券
   - 优惠券使用记录

#### 4.4.2 状态设计 (store/modules/alliance.js)
```javascript
{
  state: {
    allianceMerchants: [],
    coupons: [],
    myCoupons: []
  },
  actions: {
    getAllianceMerchants,
    getCoupons,
    getMyCoupons,
    receiveCoupon,
    useCoupon
  }
}
```

### 4.5 乡村顺风车模块

#### 4.5.1 页面设计
1. **顺风车主页** (`pages/carpool/index.vue`)
   - 发布行程入口
   - 搜索行程入口
   - 附近行程展示

2. **发布行程页** (`pages/carpool/publish.vue`)
   - 出发地/目的地选择
   - 时间选择
   - 座位数设置
   - 费用设置
   - 出行类型选择

3. **搜索行程页** (`pages/carpool/search.vue`)
   - 出发地/目的地输入
   - 时间筛选
   - 行程列表展示

4. **行程详情页** (`pages/carpool/detail.vue`)
   - 行程详细信息
   - 车主信息
   - 申请搭乘入口

5. **我的行程页** (`pages/carpool/my-trips.vue`)
   - 我发布的行程
   - 我预约的行程
   - 行程状态管理

#### 4.5.2 状态设计 (store/modules/carpool.js)
```javascript
{
  state: {
    trips: [],
    myPublishedTrips: [],
    myBookedTrips: [],
    currentTrip: {}
  },
  actions: {
    publishTrip,
    searchTrips,
    getTripDetail,
    bookTrip,
    getMyTrips,
    cancelBooking
  }
}
```

### 4.6 社区服务站模块

#### 4.6.1 页面设计
1. **服务站列表页** (`pages/station/list.vue`)
   - 附近服务站展示
   - 距离排序
   - 服务站详情入口

2. **服务站详情页** (`pages/station/detail.vue`)
   - 服务站基本信息
   - 服务内容展示
   - 代购下单入口
   - 自提预约入口

3. **代购下单页** (`pages/station/purchase.vue`)
   - 商品信息填写
   - 购买平台选择
   - 付款方式选择
   - 提交订单

4. **代购订单列表** (`pages/station/orders.vue`)
   - 订单状态筛选
   - 订单列表展示
   - 订单详情入口

#### 4.6.2 状态设计 (store/modules/station.js)
```javascript
{
  state: {
    stations: [],
    stationDetail: {},
    purchaseOrders: [],
    currentOrder: {}
  },
  actions: {
    getNearbyStations,
    getStationDetail,
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderDetail
  }
}
```

## 5. 商家端设计

### 5.1 页面结构
```
pages/merchant/
├── index.vue             # 商家首页（工作台）
├── products/             # 商品管理
│   ├── list.vue          # 商品列表
│   ├── add.vue           # 新增商品
│   └── edit.vue          # 编辑商品
├── orders/               # 订单管理
│   ├── list.vue          # 订单列表
│   └── detail.vue        # 订单详情
├── stats/                # 数据统计
│   └── index.vue         # 统计首页
├── promotions/           # 营销活动
│   ├── coupons.vue       # 优惠券管理
│   └── alliance.vue      # 联盟活动
└── settings/             # 店铺设置
    └── index.vue         # 店铺信息设置
```

### 5.2 核心功能
1. **商品管理**：上架/下架商品，设置价格、库存、规格
2. **订单处理**：接单/拒单，订单状态管理
3. **数据统计**：销售数据、热门商品分析
4. **营销工具**：创建优惠券，参与联盟活动
5. **店铺设置**：营业状态、配送范围、联系方式等

## 6. 站长端设计

### 6.1 页面结构
```
pages/station-admin/
├── index.vue             # 站长工作台
├── purchase-orders/      # 代购订单管理
│   ├── list.vue          # 订单列表
│   ├── detail.vue        # 订单详情
│   └── create.vue        # 创建订单
├── deliveries/           # 配送管理
│   ├── list.vue          # 配送任务
│   └── detail.vue        # 配送详情
├── finance/              # 财务管理
│   └── index.vue         # 收支明细
└── settings/             # 站点设置
    └── index.vue         # 站点信息设置
```

### 6.2 核心功能
1. **代购管理**：创建代购订单，跟踪采购进度
2. **自提管理**：到货通知，签收确认
3. **配送管理**：末端配送任务分配与跟踪
4. **财务管理**：收入统计，提现申请
5. **站点设置**：营业时间、服务范围等配置

## 7. 管理后台设计

### 7.1 技术栈
- **Vue3 + Element Plus**：现代化的管理后台框架
- **Vue Router**：路由管理
- **Pinia**：状态管理
- **Axios**：HTTP请求

### 7.2 页面结构
```
src/views/
├── dashboard/            # 仪表盘
├── user/                 # 用户管理
├── merchant/             # 商家管理
├── product/              # 商品管理
├── order/                # 订单管理
├── delivery/             # 配送管理
├── alliance/             # 联盟管理
├── carpool/              # 顺风车管理
├── station/              # 服务站管理
├── system/               # 系统管理
│   ├── user.vue          # 管理员管理
│   ├── role.vue          # 角色权限
│   ├── menu.vue          # 菜单管理
│   └── log.vue           # 操作日志
└── content/              # 内容管理
    ├── banner.vue        # 轮播图管理
    ├── category.vue      # 分类管理
    └── article.vue       # 文章管理
```

### 7.3 核心功能
1. **用户管理**：用户信息查看、实名认证审核、角色管理
2. **商家管理**：商家入驻审核、店铺信息管理、违规处理
3. **订单管理**：订单查看、异常订单处理、退款审核
4. **配送管理**：配送员管理、配送任务监控、异常处理
5. **联盟管理**：联盟商家审核、优惠券管理、活动管理
6. **顺风车管理**：车主认证审核、行程监控、投诉处理
7. **服务站管理**：站点审核、站点管理、代购订单监控
8. **系统管理**：管理员管理、权限配置、系统配置
9. **内容管理**：首页banner、分类管理、公告管理

## 8. 性能优化策略

### 8.1 加载优化
1. **图片懒加载**：使用`uni.preloadPages`预加载关键页面
2. **组件懒加载**：按需加载组件，减少首屏体积
3. **数据缓存**：合理使用本地缓存，减少重复请求

### 8.2 交互优化
1. **骨架屏**：在数据加载时显示骨架屏，提升用户体验
2. **防抖节流**：对搜索、滚动等高频操作进行防抖节流处理
3. **离线支持**：关键数据本地存储，支持离线查看

### 8.3 网络优化
1. **请求合并**：合并相似请求，减少网络开销
2. **数据压缩**：对大体积数据进行压缩传输
3. **CDN加速**：静态资源使用CDN分发

## 9. 安全设计

### 9.1 数据安全
1. **敏感信息加密**：手机号、身份证号等敏感信息前端脱敏展示
2. **传输加密**：全链路HTTPS加密传输
3. **本地存储加密**：重要数据本地加密存储

### 9.2 接口安全
1. **Token机制**：JWT Token认证授权
2. **接口签名**：防止接口篡改和重放攻击
3. **频率限制**：对关键接口进行频率限制

### 9.3 业务安全
1. **实名认证**：车主、乘客强制实名认证
2. **社区隔离**：顺风车行程基于社区隔离
3. **紧急联系人**：顺风车行程紧急联系人机制

## 10. 适老化设计

### 10.1 界面设计
1. **大字体**：默认字体大小16px以上
2. **高对比度**：文字与背景颜色对比度符合无障碍标准
3. **简洁布局**：减少复杂交互，保持界面简洁

### 10.2 交互设计
1. **语音输入**：支持语音搜索和输入
2. **操作确认**：关键操作增加确认步骤
3. **操作反馈**：及时的操作反馈和状态提示

### 10.3 辅助功能
1. **屏幕阅读器**：支持屏幕阅读器读取
2. **手势操作**：支持简单的手势操作
3. **快捷键**：提供常用功能的快捷操作

## 11. 测试策略

### 11.1 单元测试
1. **工具函数测试**：对utils目录下的工具函数进行单元测试
2. **组件测试**：对核心组件进行单元测试
3. **状态测试**：对store中的状态逻辑进行测试

### 11.2 接口测试
1. **Mock数据**：使用Mock.js模拟接口数据
2. **接口自动化**：编写接口自动化测试脚本
3. **异常测试**：测试接口异常情况下的处理

### 11.3 UI测试
1. **跨端测试**：在不同端（微信小程序、H5）进行UI测试
2. **兼容性测试**：在不同设备和系统版本上进行测试
3. **用户体验测试**：邀请目标用户进行体验测试

## 12. 部署方案

### 12.1 小程序部署
1. **代码编译**：使用HBuilderX编译为微信小程序代码
2. **代码上传**：通过微信开发者工具上传代码
3. **版本管理**：使用Git进行版本管理，支持灰度发布

### 12.2 H5部署
1. **构建打包**：使用Webpack进行构建打包
2. **静态资源**：部署到CDN或静态服务器
3. **域名配置**：配置HTTPS域名和备案

### 12.3 管理后台部署
1. **构建打包**：使用Vite进行构建打包
2. **服务器部署**：部署到Nginx服务器
3. **权限控制**：配置访问权限和安全策略

## 13. 监控与运维

### 13.1 性能监控
1. **页面加载时间**：监控各页面加载时间
2. **接口响应时间**：监控接口响应时间和成功率
3. **用户行为分析**：分析用户使用路径和热点功能

### 13.2 错误监控
1. **前端错误捕获**：捕获JavaScript运行时错误
2. **接口错误监控**：监控接口请求失败情况
3. **用户反馈收集**：收集用户反馈和建议

### 13.3 日志管理
1. **操作日志**：记录用户关键操作日志
2. **系统日志**：记录系统运行状态日志
3. **错误日志**：记录系统错误和异常日志

## 14. 总结

本前端架构设计充分考虑了平台的业务特点和技术要求，采用模块化设计提高代码的可维护性和可扩展性。通过合理的页面结构和状态管理，满足各业务模块的需求。同时注重性能优化和安全设计，为用户提供良好的使用体验。