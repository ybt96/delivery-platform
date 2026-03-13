# 项目阶段盘点与首轮联调计划

> 记录时间：2026-03-13  
> 项目：乡里乡亲 · 地方特色配送平台  
> 目的：确认当前项目所处阶段，沉淀首轮联调范围、验证结果模板与后续执行顺序。

---

## 一、阶段结论

结论：项目当前处于**“联调收敛期 / 闭环补齐期”**，不是从 0 到 1 的搭建阶段，也还没进入可直接上线阶段。

### 依据

1. 前端主页面与信息架构已基本成型  
   - 证据：[`miniapp/src/pages.json`](miniapp/src/pages.json) 已配置首页、商品、购物车、订单、用户、联盟、顺风车、服务站等页面。
   - 证据：[`docs/plans/2026-03-12-frontend-progress.md`](docs/plans/2026-03-12-frontend-progress.md) 记录“前端页面开发 100% 完成，首批 P0 联调兼容已完成，整体进入联调与缺口收敛阶段”。

2. 后端核心业务模块已挂载  
   - 证据：[`backend/src/app.module.ts`](backend/src/app.module.ts:16) 已接入 [`AuthModule`](backend/src/app.module.ts:21)、[`UsersModule`](backend/src/app.module.ts:22)、[`ProductsModule`](backend/src/app.module.ts:23)、[`OrdersModule`](backend/src/app.module.ts:24)、[`DeliveriesModule`](backend/src/app.module.ts:25)、[`AllianceModule`](backend/src/app.module.ts:26)、[`CarpoolModule`](backend/src/app.module.ts:27)、[`MerchantsModule`](backend/src/app.module.ts:28)、[`StationModule`](backend/src/app.module.ts:29)。

3. 数据库配置已统一走配置中心  
   - 证据：[`backend/src/database/database.module.ts`](backend/src/database/database.module.ts:12) 使用 [`TypeOrmModule.forRootAsync()`](backend/src/database/database.module.ts:12) + [`ConfigService`](backend/src/database/database.module.ts:14) 读取数据库配置，没有在模块内硬编码连接参数，符合当前项目数据库治理方向。

4. 运行态已达“可启动”，但还未达“可稳定验收”  
   - 证据：后端日志显示 `Nest application successfully started`，服务运行在 `http://localhost:3005`。
   - 证据：访问 `http://localhost:3005/health` 返回 404，说明探针接口或文档说明还未统一。
   - 证据：日志中出现 `Unknown column 'NaN' in 'where clause'`，说明参数校验和异常边界仍需补强。

---

## 二、当前已完成范围

### 1. 前端侧
- 基础架构、全局样式、请求封装已具备
- 登录、首页、商品、购物车、订单、个人中心、联盟、顺风车页面已完成主要骨架
- 服务站相关页面已进入路由注册
- 小程序开发命令已启动，具备联调条件

关键证据：
- [`miniapp/package.json`](miniapp/package.json)
- [`miniapp/src/pages.json`](miniapp/src/pages.json)
- [`miniapp/src/utils/request.js`](miniapp/src/utils/request.js:5)

### 2. 后端侧
- NestJS 服务可启动
- 核心业务模块已注册
- 服务站接口已具备列表、详情、代购单创建、代购单查询能力
- 订单模块已具备创建、我的订单、订单详情、状态更新、商家订单、统计能力

关键证据：
- [`backend/src/app.module.ts`](backend/src/app.module.ts)
- [`backend/src/modules/station/station.controller.ts`](backend/src/modules/station/station.controller.ts)
- [`backend/src/modules/orders/orders.controller.ts`](backend/src/modules/orders/orders.controller.ts)

### 3. 数据库与配置侧
- 当前采用单库模式
- 数据库配置统一从 `.env + ConfigModule` 读取
- 当前阶段继续维持单库最合适，后续再按指标触发分库设计演进

关键证据：
- [`backend/src/database/database.module.ts`](backend/src/database/database.module.ts:7)

---

## 三、当前主要缺口

### 1. 文档与运行态不一致
- [`README.md`](README.md) 中仍存在端口与健康检查说明偏差
- 当前真实运行端口为 `3005`
- 健康检查路径 `/health` 目前返回 404

影响：
- 新成员接手会误判环境
- 自动化验证和联调流程难以标准化

### 2. 订单域可能存在接口缺口
- 前端评价页 [`miniapp/src/pages/order/review.vue`](miniapp/src/pages/order/review.vue:97) 使用 [`evaluateOrder()`](miniapp/src/pages/order/review.vue:97)
- 当前已读取的 [`backend/src/modules/orders/orders.controller.ts`](backend/src/modules/orders/orders.controller.ts) 中尚未看到订单评价接口

判断：
- 订单评价链路大概率未闭环，需在联调中优先验证

### 3. 参数校验不足
- 运行日志已出现 `NaN` 落入 SQL 查询的情况
- 说明接口对 `id` / 查询参数的转换与校验不严

影响：
- 联调时会频繁出现 500
- 难以区分是前端传参错误还是后端边界防护缺失

### 4. 服务站模块已接入，但未完成完整闭环证明
- 前端 API 已存在：[`miniapp/src/api/station.js`](miniapp/src/api/station.js)
- 后端控制器已存在：[`backend/src/modules/station/station.controller.ts`](backend/src/modules/station/station.controller.ts)
- 但未形成“列表 → 详情 → 创建代购 → 查询我的代购”的完整记录

---

## 四、当前阶段建议与长期演进建议

### 当前阶段建议
先做三件事：
1. 统一文档与运行基线
2. 完成首轮接口联调
3. 补齐高优先级闭环缺口

当前不建议继续加新功能，优先把已有链路做实。

### 长期演进建议
在核心链路稳定后，再进入：
1. 微信支付正式接入
2. 后台管理端完善
3. Redis / 缓存 / 异步任务
4. 监控、日志与试运营准备
5. 数据指标驱动的数据库演进

数据库长期建议：
- 长期可分库
- 当前先单库
- 先治理模块边界、统一配置与连接命名，再视数据量和吞吐指标决定是否物理拆分

---

## 五、首轮联调目标

本轮联调目标不是一次性覆盖全部模块，而是优先验证**最关键、最容易形成闭环的链路**。

### P0 链路
1. 商品列表
2. 商品详情
3. 服务站列表
4. 服务站详情
5. 我的订单列表
6. 订单详情
7. 订单评价接口是否存在
8. 非法参数是否被正确拦截

### P1 链路
1. 创建订单
2. 订单状态更新
3. 创建代购单
4. 我的代购列表
5. 联盟列表
6. 顺风车列表

---

## 六、首轮联调执行计划

### D1：运行基线核对
交付物：
- 本文档
- 真实运行端口、接口前缀、探针接口记录

执行项：
1. 确认后端可启动
2. 确认 API 文档地址
3. 确认健康检查替代路径
4. 确认前端 baseURL 与后端服务地址一致

### D1-D2：P0 链路联调
交付物：
- 商品、订单、服务站首轮联调结果
- 错误清单与接口缺口清单

执行项：
1. 测商品列表 / 详情
2. 测订单列表 / 详情
3. 测服务站列表 / 详情
4. 测订单评价接口是否存在
5. 测非法参数访问是否返回合理错误

### D2-D3：P1 链路联调
交付物：
- 代购单、联盟、顺风车结果记录
- 下一轮修复清单

执行项：
1. 测代购单创建与查询
2. 测联盟列表
3. 测顺风车列表
4. 补文档与运行态偏差

---

## 七、首轮联调记录（2026-03-13）

### 1. 商品列表接口
- 时间：2026-03-13
- 模块：商品
- 接口：商品列表
- 请求方式：GET
- 请求地址：`http://localhost:3005/api/v1/products?take=2`
- 请求参数：`take=2`
- 返回结果：HTTP 200，返回结构为 `{"code":200,"message":"success","data":[[...],11],"timestamp":...}`
- 结论：通过
- 备注：
  - 接口可用
  - 当前 `data` 为 TypeORM 原始 [`findAndCount()`](backend/src/modules/products/products.service.ts:39) 二元数组结构 `[list, total]`
  - 若前端预期为 `{ list, total }`，后续需统一响应结构

### 2. 商品详情非法参数
- 时间：2026-03-13
- 模块：商品
- 接口：商品详情
- 请求方式：GET
- 请求地址：`http://localhost:3005/api/v1/products/abc`
- 请求参数：`id=abc`
- 返回结果：HTTP 500，`{"statusCode":500,"message":"Internal server error"}`
- 结论：失败
- 备注：
  - 已定位到 [`ProductsController.findOne()`](backend/src/modules/products/products.controller.ts:53) 直接将参数传入 [`ProductsService.findOne()`](backend/src/modules/products/products.service.ts:31)
  - 当前缺少参数转换与校验，非法 id 会导致数据库层异常

### 3. 服务站列表接口
- 时间：2026-03-13
- 模块：服务站
- 接口：附近服务站
- 请求方式：GET
- 请求地址：`http://localhost:3005/api/v1/stations/nearby`
- 请求参数：无
- 返回结果：HTTP 200，返回结构为 `{"code":200,"message":"success","data":{"code":200,"data":[]}}`
- 结论：通过，但结构异常
- 备注：
  - 控制器返回被全局响应包装后再次嵌套，形成双层 `code/data`
  - [`StationService.getNearbyStations()`](backend/src/modules/station/station.service.ts:59) 自身返回 `{ code, data }`
  - 与全局响应拦截器叠加后，最终响应结构偏冗余

### 4. 服务站详情非法参数
- 时间：2026-03-13
- 模块：服务站
- 接口：服务站详情
- 请求方式：GET
- 请求地址：`http://localhost:3005/api/v1/stations/abc`
- 请求参数：`id=abc`
- 返回结果：HTTP 500，`{"statusCode":500,"message":"Internal server error"}`
- 结论：失败
- 备注：
  - [`StationController.getStationDetail()`](backend/src/modules/station/station.controller.ts:52) 未做参数转换与校验
  - 与商品详情问题同类，需统一处理 `id` 参数校验

### 5. 我的订单未授权访问
- 时间：2026-03-13
- 模块：订单
- 接口：我的订单
- 请求方式：GET
- 请求地址：`http://localhost:3005/api/v1/orders/my`
- 请求参数：无
- 返回结果：HTTP 401，`{"message":"未提供认证token","error":"Unauthorized","statusCode":401}`
- 结论：通过
- 备注：
  - [`JwtAuthGuard`](backend/src/modules/orders/orders.controller.ts:35) 生效正常
  - 说明鉴权保护已接入

### 6. 订单评价链路确认
- 时间：2026-03-13
- 模块：订单
- 接口：订单评价
- 请求方式：前端占位调用
- 请求地址：前端当前实现为 `GET /api/v1/orders/:id`
- 请求参数：评价数据
- 返回结果：代码层确认尚未形成正式评价接口
- 结论：失败
- 备注：
  - [`miniapp/src/pages/order/review.vue`](miniapp/src/pages/order/review.vue:161) 调用 [`evaluateOrder()`](miniapp/src/pages/order/review.vue:97)
  - [`miniapp/src/api/order.js`](miniapp/src/api/order.js:82) 当前把评价实现成对 [`/api/v1/orders/:id`](miniapp/src/api/order.js:84) 的 `GET` 请求，仅为占位，不是正式评价提交接口
  - [`backend/src/modules/orders/orders.controller.ts`](backend/src/modules/orders/orders.controller.ts:19) 中未见评价接口

---

## 八、联调记录模板

后续每次联调按以下格式补充，避免口头结论无法复盘。

### 记录项
- 时间：
- 模块：
- 接口：
- 请求方式：
- 请求地址：
- 请求参数：
- 返回结果：
- 结论：通过 / 失败 / 待确认
- 备注：

---

## 九、首轮联调前已确认事实

### 已验证项
1. 后端服务已成功启动
2. 实际运行端口为 `3005`
3. API 文档地址已输出
4. 商品查询 SQL 已实际执行
5. 服务站查询 SQL 已实际执行
6. 服务站路由已注册
7. 订单路由已注册

### 未验证项
1. `/health` 替代探针接口
2. 订单评价接口是否存在
3. 订单详情非法参数是否被妥善拦截
4. 服务站完整业务闭环是否真实可用
5. 小程序侧页面与接口字段是否完全一致

---

## 十、下一步动作清单

1. 开始首轮联调，优先商品、订单、服务站
2. 记录每个接口的真实返回
3. 输出通过项、失败项、未验证项
4. 再决定是否进入代码修复阶段

---

## 十一、回滚与风险说明

### 风险点
1. 文档错误导致联调基线混乱
2. 前端已做页面但后端接口未补齐
3. 参数异常直接打穿数据库
4. 鉴权接口联调可能受测试账号限制

### 回滚思路
- 本阶段先以“验证与记录”为主，不做大规模重构
- 后续修复按模块小步提交，单问题单回滚
- 文档与探针接口优先独立修改，避免和业务逻辑耦合