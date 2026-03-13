# 乡里乡亲 · 地方特色配送平台

> 服务乡村社区的本地百货展示、预约配送、百商联盟与顺风车互助出行一体化小程序平台

---

## 📦 项目结构

```
delivery-platform/
├── backend/                # 后端 Node.js + NestJS API 服务（推荐使用）
│   ├── src/                # 源代码目录
│   │   ├── common/         # 通用模块
│   │   ├── config/         # 配置文件
│   │   ├── database/       # 数据库配置
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── users/      # 用户模块
│   │   │   ├── products/   # 商品模块
│   │   │   ├── orders/     # 订单模块
│   │   │   ├── deliveries/ # 配送模块
│   │   │   ├── alliance/   # 百商联盟模块
│   │   │   └── carpool/    # 顺风车模块
│   │   ├── app.module.ts   # 应用主模块
│   │   └── main.ts         # 应用入口
│   ├── .env                # 环境变量（不提交 git）
│   ├── package.json        # 依赖配置
│   └── docker-compose.yml  # Docker 配置
├── platform-server/        # 后端 Node.js + Express API 服务（旧版本）
│   ├── src/                # 源代码目录
│   │   ├── app.js          # 入口文件
│   │   ├── config/db.js    # MySQL 连接池
│   │   ├── middleware/     # JWT 鉴权中间件
│   │   ├── routes/         # 路由定义
│   │   └── controllers/    # 业务逻辑控制器
│   ├── .env                # 本地环境变量（不提交 git）
│   └── package.json        # 依赖配置
├── miniapp/                # 前端 Uni-app 微信小程序
│   ├── pages/              # 页面目录
│   ├── api/                # 接口请求封装
│   ├── pages.json          # 路由与 TabBar 配置
│   └── manifest.json       # 小程序 AppID 配置
└── docs/                   # 设计文档
    ├── 系统架构设计文档.md
    ├── 开发计划文档.md
    ├── 配送预约模块设计.md
    ├── 商家联盟模块设计.md
    ├── 顺风车服务模块设计.md
    └── sql/
        ├── init_schema.sql # 建表脚本
        └── seed_data.sql   # 测试种子数据
```

---

## 🔧 后端服务说明

### 推荐使用的后端服务

**backend**（NestJS + TypeScript）：
- 更完善的企业级架构
- 使用 TypeScript 提供类型安全
- 模块化设计，代码结构清晰
- 包含 Swagger API 文档
- 功能更全面，包含配送模块和联盟模块
- 端口：3000

**platform-server**（Express + JavaScript）：
- 轻量级实现，代码结构简单
- 直接使用 mysql2 操作数据库
- 端口：3000（与 backend 冲突）
- 适合快速开发和部署（旧版本）

---

## 🛠 本地开发环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 18.x | 推荐 v20 LTS |
| npm | ≥ 9.x | 随 Node.js 附带 |
| MySQL | 8.0 | Homebrew 安装 |
| HBuilderX | 最新版 | 编译 Uni-app 小程序 |
| 微信开发者工具 | 最新版 | 预览/调试小程序 |

---

## 🚀 快速启动（本地开发）

### 第一步：启动 MySQL 服务

```bash
# 检查 MySQL 是否已运行
brew services list | grep mysql

# 若未运行，启动 MySQL
brew services start mysql@8.0

# 验证连接（root 用户无密码）
mysql -u root -e "SHOW DATABASES;"
```

### 第二步：初始化数据库（首次运行）

```bash
# 创建数据库
mysql -u root -e "CREATE DATABASE IF NOT EXISTS xianglixtangqin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 执行建表脚本
mysql -u root xianglixtangqin < docs/sql/init_schema.sql

# 导入测试种子数据
mysql -u root xianglixtangqin < docs/sql/seed_data.sql

# 验证数据
mysql -u root xianglixtangqin -e "SHOW TABLES; SELECT COUNT(*) AS 商品数 FROM biz_product;"
```

### 第三步：启动后端服务（推荐使用 NestJS 版本）

```bash
cd backend

# 安装依赖（首次运行）
npm install

# 开发模式启动（热重载）
npm run start:dev

# 服务启动成功标志：
# 🚀 应用启动成功
# 📝 API 文档: http://localhost:3000/api-docs
# 🔗 服务地址: http://localhost:3000
```

### 备选方案：启动 Express 版本后端服务

```bash
cd platform-server

# 安装依赖（首次运行）
npm install

# 开发模式启动（nodemon 热重载）
npm run dev

# 服务启动成功标志：
# 🚀 服务已启动，端口: 3000
# ✅ 数据库连接成功
```

### 第四步：验证后端接口

```bash
# 健康检查
curl http://localhost:3000/health

# 获取商品分类
curl http://localhost:3000/api/product/categories

# 搜索商品（支持 keyword 关键词搜索）
curl "http://localhost:3000/api/product/search?keyword=白菜"

# 获取顺风车列表（需要 village_id）
curl "http://localhost:3000/api/carpool/list?villageId=1"
```

### 第五步：启动前端小程序

1. 打开 **HBuilderX**
2. 选择菜单 `文件` → `导入` → `从本地目录导入`，选择 `miniapp/` 目录
3. 菜单 `运行` → `运行到小程序模拟器` → `微信开发者工具`
4. 首次运行需要在 `manifest.json` 中填写真实的微信 AppID

---

## ⚙️ 环境变量说明

### backend/.env（NestJS 版本）

```env
PORT=3000                           # 服务端口
DB_HOST=127.0.0.1                   # MySQL 主机
DB_PORT=3306                        # MySQL 端口
DB_USER=root                        # MySQL 用户名
DB_PASSWORD=                        # MySQL 密码（本地无密码）
DB_NAME=xianglixtangqin             # 数据库名

JWT_SECRET=xiangli_dev_secret_...   # JWT 签名密钥
JWT_EXPIRES_IN=7d                   # Token 有效期

WX_APPID=REPLACE_WITH_YOUR_APPID    # ⚠️ 微信小程序 AppID
WX_SECRET=REPLACE_WITH_YOUR_SECRET  # ⚠️ 微信小程序 AppSecret
```

### platform-server/.env（Express 版本）

```env
PORT=3000                           # 服务端口
DB_HOST=127.0.0.1                   # MySQL 主机
DB_PORT=3306                        # MySQL 端口
DB_USER=root                        # MySQL 用户名
DB_PASSWORD=                        # MySQL 密码（本地无密码）
DB_NAME=xianglixtangqin             # 数据库名

JWT_SECRET=xiangli_dev_secret_...   # JWT 签名密钥
JWT_EXPIRES_IN=7d                   # Token 有效期

WX_APPID=REPLACE_WITH_YOUR_APPID    # ⚠️ 微信小程序 AppID
WX_SECRET=REPLACE_WITH_YOUR_SECRET  # ⚠️ 微信小程序 AppSecret
```

> ⚠️ `.env` 文件已加入 `.gitignore`，**不会被提交到代码仓库**。

---

## 🔑 微信小程序注册步骤

1. 访问 [微信公众平台](https://mp.weixin.qq.com/) → 注册 → 小程序
2. 主体类型选 **个人**（测试阶段）
3. 注册完成后，进入 `设置` → `开发设置`，获取：
   - **AppID**（小程序 ID）
   - **AppSecret**（小程序密钥）
4. 将 AppID 填入两处：
   - `backend/.env` 或 `platform-server/.env` 中的 `WX_APPID` 和 `WX_SECRET`
   - `miniapp/manifest.json` 中的 `"appid": "REPLACE_WITH_YOUR_WX_APPID"`

---

## 📡 API 接口一览

### 用户模块 `/api/user`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/user/wx-login` | 微信授权登录 | 否 |
| PUT | `/api/user/profile` | 更新实名信息 | ✅ |
| PUT | `/api/user/bind-village` | 绑定村落 | ✅ |
| GET | `/api/user/profile` | 获取个人信息 | ✅ |

### 商品模块 `/api/product`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/product/categories` | 获取分类列表 | 否 |
| GET | `/api/product/search` | 搜索商品（支持比价） | 否 |
| GET | `/api/product/:id` | 获取商品详情 | 否 |
| POST | `/api/product` | 商家上架商品 | ✅商家 |
| PUT | `/api/product/:id` | 修改商品信息 | ✅商家 |
| DELETE | `/api/product/:id` | 下架商品 | ✅商家 |

### 订单模块 `/api/order`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/order/create` | 创建订单（跨店拆单） | ✅ |
| GET | `/api/order/list` | 我的订单列表 | ✅ |
| GET | `/api/order/:id` | 订单详情 | ✅ |
| PUT | `/api/order/:id/cancel` | 取消订单 | ✅ |
| PUT | `/api/order/sub/:id/status` | 商家更新子订单状态 | ✅商家 |

### 商家模块 `/api/merchant`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/merchant/apply` | 申请入驻 | ✅ |
| GET | `/api/merchant/list` | 商家列表 | 否 |
| GET | `/api/merchant/:id` | 商家详情 | 否 |
| PUT | `/api/merchant/:id` | 更新商家信息 | ✅商家 |

### 顺风车模块 `/api/carpool`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/carpool/publish` | 发布行程 | ✅ |
| GET | `/api/carpool/list` | 同村行程列表 | ✅ |
| GET | `/api/carpool/:id` | 行程详情 | ✅ |
| POST | `/api/carpool/:id/join` | 申请搭乘 | ✅ |
| PUT | `/api/carpool/passenger/:id/approve` | 村长审批 | ✅村长 |

### 配送模块 `/api/deliveries`（仅 NestJS 版本支持）

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/deliveries/task` | 创建配送任务 | ✅ |
| GET | `/api/deliveries/task/:id` | 获取配送任务详情 | ✅ |
| PUT | `/api/deliveries/task/:id/status` | 更新配送任务状态 | ✅ |
| GET | `/api/deliveries/track/:id` | 获取配送轨迹 | ✅ |

### 百商联盟模块 `/api/alliance`（仅 NestJS 版本支持）

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/alliance/agreement` | 创建联盟协议 | ✅商家 |
| GET | `/api/alliance/agreement/:id` | 获取联盟协议详情 | ✅ |
| POST | `/api/alliance/coupon` | 创建优惠券 | ✅商家 |
| GET | `/api/alliance/coupon/list` | 获取优惠券列表 | ✅ |
| POST | `/api/alliance/coupon/:id/claim` | 领取优惠券 | ✅ |

---

## 🗂 数据库表结构

| 表名 | 说明 |
|------|------|
| `sys_village` | 村落信息 |
| `sys_user` | 用户（含村长/商家/平台管理员角色） |
| `user_address` | 用户收货地址 |
| `biz_merchant` | 商家信息 |
| `biz_category` | 商品分类 |
| `biz_product` | 商品（支持多商家同品比价） |
| `ord_main` | 主订单（用户维度） |
| `ord_sub` | 子订单（按商家拆分） |
| `ord_item` | 订单商品明细 |
| `carpool_trip` | 顺风车行程 |
| `delivery_task` | 配送任务（仅 NestJS 版本使用） |
| `delivery_track` | 配送轨迹（仅 NestJS 版本使用） |
| `alliance_agreement` | 联盟协议（仅 NestJS 版本使用） |
| `coupon_template` | 优惠券模板（仅 NestJS 版本使用） |
| `user_coupon` | 用户优惠券（仅 NestJS 版本使用） |

---

## 🧪 测试账号（种子数据）

| 用户名 | 角色 | openid | 说明 |
|--------|------|--------|------|
| 张平台 | 平台管理员 | `admin_openid_001` | 超级管理员 |
| 李村长 | 村落管理员 | `leader_openid_001` | 张家坪村村长 |
| 王建国 | 商家 | `merchant_openid_001` | 老王蔬菜铺老板 |
| 赵美丽 | 商家 | `merchant_openid_002` | 香香饭馆老板娘 |
| 陈刚 | 商家 | `merchant_openid_003` | 利民五金店老板 |
| 刘小红 | 普通用户 | `user_openid_001` | 张家坪村村民 |
| 孙大壮 | 普通用户 | `user_openid_002` | 李家湾村村民 |
| 周秀英 | 普通用户 | `user_openid_003` | 王家沟村村民 |

---

## 🔧 常见问题排查

**Q: MySQL 无法连接？**
```bash
# 检查 MySQL 状态
brew services list | grep mysql
# 重启 MySQL
brew services restart mysql@8.0
```

**Q: 端口 3000 被占用？**
```bash
lsof -ti:3000 | xargs kill -9
cd backend && npm run start:dev
```

**Q: 微信登录接口报错 `invalid code`？**
- 确认 `.env` 中 `WX_APPID` 和 `WX_SECRET` 已替换为真实值
- 开发阶段可使用微信开发者工具获取测试 code

**Q: 数据库中文乱码？**
```bash
# 确认数据库字符集
mysql -u root -e "SHOW CREATE DATABASE xianglixtangqin;"
# 应显示 utf8mb4
```

---

## 📋 开发进度

- [x] 系统架构与技术选型设计
- [x] 数据库表结构设计（10张核心表）
- [x] 后端 API 全量开发（用户/商品/订单/商家/顺风车）
- [x] 前端小程序页面开发（21个页面）
- [x] 本地开发环境搭建与验证
- [x] NestJS 后端服务开发（增强版）
- [ ] 微信小程序真机注册与配置
- [ ] HBuilderX + 微信开发者工具安装
- [ ] 前后端联调测试
- [ ] 管理后台开发
- [ ] 生产环境部署

---

*最后更新：2026-03-11 | 乡里乡亲平台开发团队*