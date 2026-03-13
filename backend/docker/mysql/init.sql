-- 初始化数据库脚本
CREATE DATABASE IF NOT EXISTS delivery_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE delivery_platform;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码(bcrypt加密)',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号(加密存储)',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名(实名认证后填写)',
  `id_card` VARCHAR(100) DEFAULT NULL COMMENT '身份证号(加密存储，顺风车必填)',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别 0未知 1男 2女',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0禁用 1正常',
  `is_verified` TINYINT DEFAULT 0 COMMENT '实名认证 0未认证 1已认证',
  `role` VARCHAR(20) DEFAULT NULL COMMENT '角色',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户主表';

-- 创建商家表
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '店铺名称',
  `category_id` INT UNSIGNED DEFAULT NULL COMMENT '分类ID',
  `description` TEXT DEFAULT NULL COMMENT '店铺简介',
  `logo` VARCHAR(255) DEFAULT NULL COMMENT '店铺Logo',
  `banner` VARCHAR(255) DEFAULT NULL COMMENT '店铺横幅图',
  `address` VARCHAR(255) NOT NULL COMMENT '店铺地址',
  `latitude` DECIMAL(10,6) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,6) DEFAULT NULL COMMENT '经度',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `business_hours` VARCHAR(100) DEFAULT NULL COMMENT '营业时间',
  `license_img` VARCHAR(255) DEFAULT NULL COMMENT '营业执照图片',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0待审核 1正常 2违规封禁',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '综合评分',
  `review_count` INT DEFAULT 0 COMMENT '评价总数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家信息表';

-- 创建商品表
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` BIGINT UNSIGNED NOT NULL COMMENT '所属商家ID',
  `category_id` INT UNSIGNED NOT NULL COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `description` TEXT DEFAULT NULL COMMENT '商品描述',
  `cover_image` VARCHAR(255) NOT NULL COMMENT '商品主图',
  `price` DECIMAL(10,2) NOT NULL COMMENT '当前售价',
  `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '划线原价',
  `price_min` DECIMAL(10,2) DEFAULT NULL COMMENT '价格区间-最低',
  `price_max` DECIMAL(10,2) DEFAULT NULL COMMENT '价格区间-最高',
  `stock` INT DEFAULT 0 COMMENT '库存数量',
  `sales` INT DEFAULT 0 COMMENT '已售数量',
  `unit` VARCHAR(20) DEFAULT '件' COMMENT '单位',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分',
  `review_count` INT DEFAULT 0 COMMENT '评价数',
  `is_delivery` TINYINT DEFAULT 1 COMMENT '是否支持配送 0否 1是',
  `is_alliance` TINYINT DEFAULT 0 COMMENT '是否参与百商联盟优惠 0否 1是',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0下架 1上架',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_merchant` (`merchant_id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品主表';

-- 创建订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '下单用户ID',
  `merchant_id` BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
  `deliverer_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '配送员ID',
  `address_id` BIGINT UNSIGNED NOT NULL COMMENT '收货地址ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00 COMMENT '配送费',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `pay_type` TINYINT DEFAULT NULL COMMENT '支付方式 1微信 2支付宝 3现金',
  `pay_time` DATETIME DEFAULT NULL COMMENT '支付时间',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0待支付 1已支付 2商家接单 3配送中 4已完成 5已取消 6退款中 7已退款',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '买家备注',
  `cancel_reason` VARCHAR(255) DEFAULT NULL COMMENT '取消原因',
  `appointment_time` DATETIME DEFAULT NULL COMMENT '预约配送时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- 创建配送员表
CREATE TABLE IF NOT EXISTS `deliverers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '配送员姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `id_card` VARCHAR(100) DEFAULT NULL COMMENT '身份证号',
  `vehicle_type` VARCHAR(30) DEFAULT NULL COMMENT '交通工具',
  `vehicle_no` VARCHAR(30) DEFAULT NULL COMMENT '车牌号',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0离线 1空闲 2配送中',
  `rating` DECIMAL(3,2) DEFAULT 5.00 COMMENT '评分',
  `total_orders` INT DEFAULT 0 COMMENT '总配送单数',
  `latitude` DECIMAL(10,6) DEFAULT NULL COMMENT '当前纬度',
  `longitude` DECIMAL(10,6) DEFAULT NULL COMMENT '当前经度',
  `location_at` DATETIME DEFAULT NULL COMMENT '位置最后更新时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配送员信息表';

-- 创建联盟协议表
CREATE TABLE IF NOT EXISTS `alliance_agreements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
  `sign_time` DATETIME NOT NULL COMMENT '签署时间',
  `expire_time` DATETIME DEFAULT NULL COMMENT '协议到期时间',
  `discount_rate` DECIMAL(4,2) DEFAULT NULL COMMENT '承诺折扣率',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0失效 1有效',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='百商联盟协议表';

-- 创建优惠券模板表
CREATE TABLE IF NOT EXISTS `coupon_templates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '商家ID',
  `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  `type` TINYINT NOT NULL COMMENT '类型 1满减 2折扣 3代金券',
  `face_value` DECIMAL(10,2) DEFAULT NULL COMMENT '面值',
  `min_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '最低消费金额',
  `discount_rate` DECIMAL(4,2) DEFAULT NULL COMMENT '折扣率',
  `total` INT NOT NULL COMMENT '发行总量',
  `received` INT DEFAULT 0 COMMENT '已领取数量',
  `used` INT DEFAULT 0 COMMENT '已使用数量',
  `start_time` DATETIME NOT NULL COMMENT '活动开始时间',
  `end_time` DATETIME NOT NULL COMMENT '活动结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0下架 1正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_merchant_id` (`merchant_id`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券模板表';

-- 创建用户领券记录表
CREATE TABLE IF NOT EXISTS `user_coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `template_id` INT UNSIGNED NOT NULL COMMENT '优惠券模板ID',
  `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用时关联的订单ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0未使用 1已使用 2已过期',
  `received_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '领券时间',
  `used_at` DATETIME DEFAULT NULL COMMENT '使用时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户领券记录表';

-- 创建顺风车用户认证表
CREATE TABLE IF NOT EXISTS `carpool_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `role` TINYINT NOT NULL COMMENT '角色 1车主 2乘客 3两者都是',
  `driver_license` VARCHAR(100) DEFAULT NULL COMMENT '驾照编号',
  `license_img` VARCHAR(255) DEFAULT NULL COMMENT '驾照图片',
  `vehicle_brand` VARCHAR(50) DEFAULT NULL COMMENT '车辆品牌',
  `vehicle_color` VARCHAR(20) DEFAULT NULL COMMENT '车辆颜色',
  `vehicle_plate` VARCHAR(20) DEFAULT NULL COMMENT '车牌号',
  `vehicle_img` VARCHAR(255) DEFAULT NULL COMMENT '车辆照片',
  `max_passengers` INT DEFAULT 3 COMMENT '最大载客人数',
  `special_needs` VARCHAR(255) DEFAULT NULL COMMENT '特殊需求',
  `village` VARCHAR(100) DEFAULT NULL COMMENT '所在村庄',
  `village_verified` TINYINT DEFAULT 0 COMMENT '社区认证',
  `verify_status` TINYINT DEFAULT 0 COMMENT '认证状态',
  `reject_reason` VARCHAR(255) DEFAULT NULL COMMENT '拒绝原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='顺风车用户认证表';

-- 创建顺风车行程表
CREATE TABLE IF NOT EXISTS `carpool_trips` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` BIGINT UNSIGNED NOT NULL COMMENT '车主用户ID',
  `village` VARCHAR(100) NOT NULL COMMENT '发车所在村庄',
  `from_address` VARCHAR(255) NOT NULL COMMENT '出发地详细地址',
  `from_lat` DECIMAL(10,6) NOT NULL COMMENT '出发地纬度',
  `from_lng` DECIMAL(10,6) NOT NULL COMMENT '出发地经度',
  `to_address` VARCHAR(255) NOT NULL COMMENT '目的地详细地址',
  `to_lat` DECIMAL(10,6) NOT NULL COMMENT '目的地纬度',
  `to_lng` DECIMAL(10,6) NOT NULL COMMENT '目的地经度',
  `departure_time` DATETIME NOT NULL COMMENT '出发时间',
  `available_seats` INT NOT NULL COMMENT '剩余可搭乘人数',
  `total_seats` INT NOT NULL COMMENT '总可搭乘人数',
  `price_per_seat` DECIMAL(8,2) DEFAULT 0.00 COMMENT '每人费用',
  `trip_type` TINYINT DEFAULT 1 COMMENT '出行类型',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '行程说明',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_driver_id` (`driver_id`),
  KEY `idx_village` (`village`),
  KEY `idx_departure_time` (`departure_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='顺风车行程表';

-- 创建顺风车预约记录表
CREATE TABLE IF NOT EXISTS `carpool_bookings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `trip_id` BIGINT UNSIGNED NOT NULL COMMENT '行程ID',
  `passenger_id` BIGINT UNSIGNED NOT NULL COMMENT '乘客用户ID',
  `seats` INT DEFAULT 1 COMMENT '预约座位数',
  `pickup_address` VARCHAR(255) DEFAULT NULL COMMENT '乘客上车地址',
  `pickup_lat` DECIMAL(10,6) DEFAULT NULL COMMENT '上车点纬度',
  `pickup_lng` DECIMAL(10,6) DEFAULT NULL COMMENT '上车点经度',
  `passenger_type` TINYINT DEFAULT 1 COMMENT '乘客类型',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `status` TINYINT DEFAULT 0 COMMENT '状态',
  `reject_reason` VARCHAR(255) DEFAULT NULL COMMENT '拒绝原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_trip_passenger` (`trip_id`, `passenger_id`),
  KEY `idx_passenger_id` (`passenger_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='顺风车预约记录表';