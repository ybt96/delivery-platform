# 数据库统一设计方案

> 文档版本：1.0
> 创建时间：2026-03-13
> 适用项目：地方特色局域网络物资配送平台

---

## 1. 项目系统架构概述

### 1.1 系统组成

| 系统名称 | 技术栈 | 端口 | 说明 |
|---------|-------|------|------|
| **backend** (新) | NestJS + TypeORM | 3005 | 统一后端服务，**开发中** |
| **platform-server** (老) | Express + mysql2 | 3000 | 遗留 Express 服务，**维护中** |
| **vue-admin-template** | Vue 2 + Element UI | 9528 | Web 后台管理界面 |
| **miniapp** | Vite + uni-app | - | 小程序/H5 移动端 |

### 1.2 系统关系图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              小程序/移动H5 (miniapp)                     │
│                                    ▲                                     │
│                                    │ 调用                                │
│                                    │                                     │
│                    ┌───────────────┴────────────────┐                   │
│                    │                                │                   │
│                    │                                │                   │
│  ┌─────────────────▼──────────┐   ┌────────────────▼───────────────┐  │
│  │   platform-server (老)     │   │    backend (新)                 │  │
│  │   Express + mysql2         │   │    NestJS + TypeORM            │  │
│  │   端口: 3000               │   │    端口: 3005                   │  │
│  │   微信登录 + 业务接口      │   │    JWT + 统一业务接口           │  │
│  └────────────────────────────┘   └─────────────────────────────────┘  │
│                                    ▲                                     │
│                                    │ 调用                                │
│                                    │                                     │
│                    ┌───────────────┴────────────────┐                   │
│                    │                                │                   │
│                    │                                │                   │
│  ┌─────────────────▼──────────┐   ┌────────────────▼───────────────┐  │
│  │   vue-admin-template       │   │    其他前端系统                 │  │
│  │   Web 管理后台             │   │                                │  │
│  │   端口: 9528               │   │                                │  │
│  │   管理运营功能             │   │                                │  │
│  └────────────────────────────┘   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ 查询/写入
                                      ▼
                              ┌──────────────────┐
                              │   MySQL 数据库    │
                              │  xianglixtangqin  │
                              └──────────────────┘
```

---

## 2. 数据库现状分析

### 2.1 已有表结构对比

#### 核心表对比表

| 业务实体 | 表名 (老) | 表名 (新) | 字段一致性 | 状态 |
|---------|----------|----------|-----------|------|
| 用户 | `sys_user` | `users` | ⚠️ 不一致 | **冲突** |
| 商家 | `biz_merchant` | `merchants` | ⚠️ 不一致 | **冲突** |
| 商品 | `biz_product` | `products` | ⚠️ 不一致 | **冲突** |
| 订单主表 | `ord_main` | `orders` | ⚠️ 不一致 | **冲突** |
| 订单明细 | `ord_item` | `order_items` | ⚠️ 不一致 | **冲突** |
| 车主认证 | `carpool_profiles` | `carpool_profiles` | ✅ 一致 | OK |
| 顺风车行程 | `carpool_trip` | `carpool_trips` | ⚠️ 名称差异 | **需统一** |
| 顺风车预订 | `carpool_bookings` | `carpool_bookings` | ✅ 一致 | OK |
| 联盟协议 | `alliance_agreements` | `alliance_agreements` | ✅ 一致 | OK |
| 优惠券模板 | `coupon_templates` | `coupon_templates` | ✅ 一致 | OK |
| 用户优惠券 | `user_coupons` | `user_coupons` | ✅ 一致 | OK |
| 配送员 | `deliverers` | `deliverers` | ✅ 一致 | OK |
| 配送任务 | `delivery_tasks` | `delivery_tasks` | ✅ 一致 | OK |
| 配送轨迹 | `delivery_tracks` | `delivery_tracks` | ✅ 一致 | OK |
| 商品图片 | `product_images` | `product_images` | ✅ 一致 | OK |
| 商品规格 | `product_specs` | `product_specs` | ✅ 一致 | OK |
| 支付记录 | `payment_records` | `payment_records` | ✅ 一致 | OK |
| 村落信息 | `sys_village` | 无 | ❌ 缺失 | **需添加** |

### 2.2 用户表详细对比

#### sys_user (老 - platform-server)

| 字段名 | 类型 | 说明 | 备注 |
|-------|------|------|------|
| `id` | bigint | 主键 |
| `wx_openid` | varchar(64) | 微信 OpenID | **唯一标识** |
| `nickname` | varchar(64) | 昵称 |
| `avatar_url` | varchar(255) | 头像 |
| `real_name` | varchar(50) | 真实姓名 |
| `phone` | varchar(20) | 手机号 |
| `village_id` | bigint | 所属村落 |
| `is_certified` | tinyint(1) | 实名认证状态 |
| `role_type` | tinyint(1) | 角色类型 | 1=普通用户, 2=商家, 3=配送员, 4=管理员 |
| `create_time` | datetime | 创建时间 |
| `update_time` | datetime | 更新时间 |

#### users (新 - backend)

| 字段名 | 类型 | 说明 | 备注 |
|-------|------|------|------|
| `id` | int | 主键 |
| `username` | varchar(50) | 用户名 | **新增字段** |
| `password` | varchar(255) | 密码 | **新增字段** |
| `phone` | varchar(20) | 手机号 |
| `realName` | varchar(50) | 真实姓名 |
| `idCard` | varchar(100) | 身份证号 | **新增字段** |
| `avatar` | varchar(255) | 头像 |
| `gender` | tinyint | 性别 | 0=未知, 1=男, 2=女 |
| `status` | tinyint | 状态 | 0=禁用, 1=正常 |
| `isVerified` | tinyint | 实名认证 |
| `role` | varchar(20) | 角色 | enum: consumer, merchant, deliverer, admin |
| `createdAt` | datetime | 创建时间 |
| `updatedAt` | datetime | 更新时间 |

---

## 3. 数据库统一设计方案

### 3.1 统一原则

| 原则 | 说明 |
|-----|------|
| **1. 主体用户表统一** | 以 `users` 为主表，`sys_user` 作为微信小程序登录的辅助表 |
| **2. 表命名规范** | 使用小写+下划线命名法 (snake_case) |
| **3. 字段命名规范** | 使用小写+下划线命名法，与 TypeORM 实体属性驼峰命名区分 |
| **4. 主键类型统一** | 统一使用 `bigint` 类型 |
| **5. 时间字段统一** | 统一使用 `created_at`, `updated_at` 命名 |

### 3.2 统一后的表结构设计

#### 3.2.1 用户表 (users)

```sql
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `wx_openid` varchar(64) DEFAULT NULL COMMENT '微信OpenID',
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码(加密存储)',
  `phone` varchar(20) NOT NULL UNIQUE COMMENT '手机号(加密存储)',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` varchar(100) DEFAULT NULL COMMENT '身份证号(加密存储)',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint DEFAULT '0' COMMENT '性别 0未知 1男 2女',
  `status` tinyint DEFAULT '1' COMMENT '状态 0禁用 1正常',
  `is_verified` tinyint DEFAULT '0' COMMENT '实名认证 0未认证 1已认证',
  `role` varchar(20) DEFAULT NULL COMMENT '角色 consumer/merchant/deliverer/admin',
  `village_id` bigint DEFAULT NULL COMMENT '所属村落ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`wx_openid`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_role` (`role`),
  KEY `idx_village` (`village_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基本信息表';
```

#### 3.2.2 商家表 (merchants)

```sql
CREATE TABLE `merchants` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商家ID',
  `user_id` bigint NOT NULL COMMENT '所属用户ID',
  `shop_name` varchar(100) NOT NULL COMMENT '店铺名称',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `category_name` varchar(50) DEFAULT NULL COMMENT '分类名称(冗余)',
  `description` text COMMENT '店铺描述',
  `logo` varchar(255) DEFAULT NULL COMMENT '店铺logo',
  `banner` varchar(255) DEFAULT NULL COMMENT '店铺横幅',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `phone` varchar(20) NOT NULL COMMENT '联系电话',
  `business_hours` varchar(100) DEFAULT NULL COMMENT '营业时间',
  `license_img` varchar(255) DEFAULT NULL COMMENT '营业执照图片',
  `is_alliance` tinyint DEFAULT '0' COMMENT '是否参与联盟优惠 0否 1是',
  `status` tinyint DEFAULT '0' COMMENT '状态 0审核中 1正常 2审核拒绝',
  `rating` decimal(3,2) DEFAULT '5.00' COMMENT '评分',
  `review_count` int DEFAULT '0' COMMENT '评价数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家表';
```

#### 3.2.3 商品表 (products)

```sql
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `merchant_id` bigint NOT NULL COMMENT '所属商家ID',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `category_name` varchar(50) DEFAULT NULL COMMENT '分类名称(冗余)',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` text COMMENT '商品描述',
  `cover_image` varchar(255) NOT NULL COMMENT '商品主图',
  `price` decimal(10,2) NOT NULL COMMENT '当前售价',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '划线原价',
  `price_min` decimal(10,2) DEFAULT NULL COMMENT '价格区间-最低',
  `price_max` decimal(10,2) DEFAULT NULL COMMENT '价格区间-最高',
  `stock` int DEFAULT '0' COMMENT '库存数量',
  `sales` int DEFAULT '0' COMMENT '已售数量',
  `unit` varchar(20) DEFAULT '件' COMMENT '单位',
  `rating` decimal(3,2) DEFAULT '5.00' COMMENT '评分',
  `review_count` int DEFAULT '0' COMMENT '评价数',
  `is_delivery` tinyint DEFAULT '1' COMMENT '是否支持配送 0否 1是',
  `is_alliance` tinyint DEFAULT '0' COMMENT '是否参与联盟优惠 0否 1是',
  `status` tinyint DEFAULT '1' COMMENT '状态 0下架 1上架',
  `sort` int DEFAULT '0' COMMENT '排序',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_merchant` (`merchant_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

#### 3.2.4 订单主表 (orders)

```sql
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` bigint NOT NULL COMMENT '下单用户ID',
  `merchant_id` bigint NOT NULL COMMENT '商家ID',
  `deliverer_id` bigint DEFAULT NULL COMMENT '配送员ID',
  `address_id` bigint NOT NULL COMMENT '收货地址ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠金额',
  `delivery_fee` decimal(10,2) DEFAULT '0.00' COMMENT '配送费',
  `pay_amount` decimal(10,2) NOT NULL COMMENT '实付金额',
  `pay_type` tinyint DEFAULT NULL COMMENT '支付方式 1微信 2支付宝 3现金',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `status` tinyint DEFAULT '0' COMMENT '状态 0待支付 1已支付 2配送中 3已完成 4已取消',
  `remark` varchar(255) DEFAULT NULL COMMENT '买家备注',
  `cancel_reason` varchar(255) DEFAULT NULL COMMENT '取消原因',
  `appointment_time` datetime DEFAULT NULL COMMENT '预约配送时间',
  `delivery_batch` varchar(50) DEFAULT NULL COMMENT '配送批次',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_merchant` (`merchant_id`),
  KEY `idx_deliverer` (`deliverer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

#### 3.2.5 订单明细表 (order_items)

```sql
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单明细ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品名称(快照)',
  `product_img` varchar(255) DEFAULT NULL COMMENT '商品图片(快照)',
  `spec_name` varchar(100) DEFAULT NULL COMMENT '规格名称(快照)',
  `unit_price` decimal(10,2) NOT NULL COMMENT '单价(快照)',
  `quantity` int NOT NULL COMMENT '购买数量',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小计金额',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细表';
```

#### 3.2.6 村落表 (villages)

```sql
CREATE TABLE `villages` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '村落ID',
  `name` varchar(100) NOT NULL COMMENT '村落名称',
  `town_name` varchar(100) NOT NULL COMMENT '所属乡镇',
  `status` tinyint DEFAULT '1' COMMENT '状态 0停用 1启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='村落/社区信息表';
```

#### 3.2.7 用户地址表 (user_addresses)

```sql
CREATE TABLE `user_addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `receiver_name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `receiver_phone` varchar(20) NOT NULL COMMENT '收货人电话',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `village_id` bigint DEFAULT NULL COMMENT '所属村落ID',
  `is_default` tinyint DEFAULT '0' COMMENT '是否默认 0否 1是',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_village` (`village_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';
```

---

## 4. 迁移与兼容方案

### 4.1 迁移策略

| 阶段 | 目标 | 方案 |
|-----|------|------|
| **阶段一** | 数据库表结构统一 | 按上述设计创建新表，保留旧表用于数据迁移 |
| **阶段二** | 数据同步 | 编写数据迁移脚本，将旧表数据同步到新表 |
| **阶段三** | 双写机制 | 新服务与老服务同时写入新表，确保数据一致性 |
| **阶段四** | 服务切换 | 逐步将前端流量切换到新服务 |
| **阶段五** | 旧服务下线 | 确认新服务稳定后，下线旧服务 |

### 4.2 数据迁移脚本 (示例)

```sql
-- 1. 迁移用户数据（从 sys_user 到 users）
INSERT INTO users (
  wx_openid, username, password, phone, real_name, avatar, gender, status,
  is_verified, role, village_id, create_time, update_time
)
SELECT
  wx_openid,
  CONCAT('user_', id) AS username,
  SHA2(CONCAT(wx_openid, 'default_password'), 256) AS password,
  phone,
  real_name,
  avatar_url AS avatar,
  0 AS gender,
  1 AS status,
  is_certified AS is_verified,
  CASE
    WHEN role_type = 1 THEN 'consumer'
    WHEN role_type = 2 THEN 'merchant'
    WHEN role_type = 3 THEN 'deliverer'
    WHEN role_type = 4 THEN 'admin'
    ELSE 'consumer'
  END AS role,
  village_id,
  create_time,
  update_time
FROM sys_user
WHERE wx_openid IS NOT NULL;

-- 2. 迁移商家数据（从 biz_merchant 到 merchants）
INSERT INTO merchants (
  user_id, shop_name, category_id, category_name, description, logo, banner,
  address, latitude, longitude, phone, business_hours, license_img,
  is_alliance, status, rating, review_count, create_time, update_time
)
SELECT
  owner_user_id AS user_id,
  shop_name,
  category_id,
  category,
  NULL AS description,
  NULL AS logo,
  NULL AS banner,
  address,
  longitude,
  latitude,
  '' AS phone,
  NULL AS business_hours,
  NULL AS license_img,
  is_alliance,
  status,
  5.00 AS rating,
  0 AS review_count,
  create_time,
  NOW() AS update_time
FROM biz_merchant;

-- 3. 迁移商品数据（从 biz_product 到 products）
INSERT INTO products (
  merchant_id, category_id, category_name, name, description, cover_image,
  price, stock, sales, unit, rating, review_count, is_alliance, status,
  create_time, update_time
)
SELECT
  merchant_id,
  category_id,
  (SELECT name FROM biz_category WHERE id = biz_product.category_id) AS category_name,
  name,
  description,
  image_url AS cover_image,
  price,
  stock,
  0 AS sales,
  unit,
  5.00 AS rating,
  0 AS review_count,
  0 AS is_alliance,
  status,
  create_time,
  NOW() AS update_time
FROM biz_product;
```

### 4.3 TypeORM 实体映射配置

```typescript
// 示例：users 实体配置
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'wx_openid', length: 64, nullable: true })
  wxOpenid: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ name: 'real_name', length: 50, nullable: true })
  realName: string;

  @Column({ name: 'id_card', length: 100, nullable: true })
  idCard: string;

  @Column({ name: 'avatar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'gender', default: 0 })
  gender: number;

  @Column({ name: 'status', default: 1 })
  status: number;

  @Column({ name: 'is_verified', default: 0 })
  isVerified: number;

  @Column({ name: 'role', length: 20, nullable: true })
  role: UserRole;

  @Column({ name: 'village_id', nullable: true })
  villageId: number;

  @Column({ name: 'create_time', type: 'datetime' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'update_time', type: 'datetime' })
  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 5. 权限角色设计

### 5.1 角色枚举

| 角色 | 值 | 说明 |
|-----|----|------|
| `consumer` | 消费者 | 可以下单、查看商品 |
| `merchant` | 商家 | 可以管理商品、查看订单 |
| `deliverer` | 配送员 | 可以查看配送任务、上传位置 |
| `admin` | 管理员 | 所有权限 |

### 5.2 权限矩阵

| 权限 | consumer | merchant | deliverer | admin |
|-----|---------|----------|-----------|-------|
| 订单查询 | ✅ | ✅ | ❌ | ✅ |
| 商品管理 | ❌ | ✅ | ❌ | ✅ |
| 订单管理 | ❌ | ✅ | ❌ | ✅ |
| 用户管理 | ❌ | ❌ | ❌ | ✅ |
| 配送任务 | ❌ | ❌ | ✅ | ✅ |
| 数据统计 | ❌ | ✅ | ❌ | ✅ |

---

## 6. 实施计划

### 6.1 第一周：数据库表结构统一

- [ ] 创建新的数据库表结构（参考第 3.2 节）
- [ ] 编写数据迁移脚本
- [ ] 测试迁移脚本执行

### 6.2 第二周：NestJS 实体与服务开发

- [ ] 更新 TypeORM 实体类
- [ ] 实现业务服务层
- [ ] 编写单元测试

### 6.3 第三周：接口开发与联调

- [ ] 完善 API 接口
- [ ] 前后端联调
- [ ] 修复发现的问题

### 6.4 第四周：灰度发布与监控

- [ ] 灰度切换用户流量
- [ ] 监控系统运行状态
- [ ] 收集用户反馈

---

## 7. 总结

### 7.1 关键决策

| 决策 | 理由 |
|-----|------|
| **保留 `users` 作为主表** | NestJS 服务为新开发，应以新表结构为准 |
| **使用 `wx_openid` 关联微信用户** | 保留 `sys_user` 的微信登录能力 |
| **字段命名使用 snake_case** | 符合数据库命名规范 |
| **时间字段使用 `created_at`/`updated_at`** | 统一时间字段命名 |

### 7.2 风险与应对

| 风险 | 应对措施 |
|-----|---------|
| 数据迁移失败 | 充分测试，保留旧表，准备回滚方案 |
| 新旧服务数据不一致 | 实施双写机制，确保数据同步 |
| 前端兼容性问题 | 逐步切换，保留旧接口作为降级方案 |

---

**文档结束**
