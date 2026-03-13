-- 地方特色局域网络物资配送平台 - 核心数据库表结构设计 (MySQL)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 基础信息与用户模块
-- ----------------------------

-- 村落/社区(网格)表
CREATE TABLE `sys_village` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '村落/社区名称 (如: 张家村、李家庄)',
  `town_name` varchar(100) DEFAULT NULL COMMENT '所属乡镇',
  `admin_user_id` bigint(20) DEFAULT NULL COMMENT '圈子管理员/村长用户ID',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态: 0-停用, 1-启用',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='村落/社区信息表';

-- 用户表
CREATE TABLE `sys_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `wx_openid` varchar(64) NOT NULL COMMENT '微信OpenID',
  `nickname` varchar(64) DEFAULT NULL COMMENT '微信昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `village_id` bigint(20) DEFAULT NULL COMMENT '所属村落ID',
  `is_certified` tinyint(1) DEFAULT '0' COMMENT '实名认证状态: 0-未认证, 1-审核中, 2-已认证',
  `role_type` tinyint(1) DEFAULT '1' COMMENT '角色: 1-普通村民, 2-商家老板, 3-村级团长, 4-平台管理员',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wx_openid` (`wx_openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基本信息表';

-- 用户收货地址表
CREATE TABLE `user_address` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `receiver_name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(20) NOT NULL COMMENT '联系电话',
  `village_id` bigint(20) NOT NULL COMMENT '村落ID',
  `detail_address` varchar(255) NOT NULL COMMENT '详细地址(如：村东头大树旁)',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认地址',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';


-- ----------------------------
-- 2. 商家与商品模块
-- ----------------------------

-- 商家/店铺表
CREATE TABLE `biz_merchant` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `owner_user_id` bigint(20) NOT NULL COMMENT '店主用户ID',
  `shop_name` varchar(100) NOT NULL COMMENT '店铺名称',
  `category` varchar(50) DEFAULT NULL COMMENT '店铺主营品类(如: 生鲜, 五金)',
  `address` varchar(255) DEFAULT NULL COMMENT '店铺物理地址(镇上具体位置)',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `is_alliance` tinyint(1) DEFAULT '0' COMMENT '是否加入百商联盟: 0-否, 1-是',
  `status` tinyint(1) DEFAULT '1' COMMENT '营业状态: 0-打烊, 1-营业中',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='本地商家表';

-- 商品分类表
CREATE TABLE `biz_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称(如: 新鲜蔬菜, 肉禽蛋类)',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序',
  `icon_url` varchar(255) DEFAULT NULL COMMENT '分类图标',
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='平台商品分类表';

-- 商品SPU表
CREATE TABLE `biz_product` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `merchant_id` bigint(20) NOT NULL COMMENT '所属商家ID',
  `category_id` bigint(20) NOT NULL COMMENT '平台分类ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` varchar(500) DEFAULT NULL COMMENT '商品描述(可备注好赖程度)',
  `image_url` varchar(255) DEFAULT NULL COMMENT '主图实拍',
  `price` decimal(10,2) NOT NULL COMMENT '售卖价格',
  `alliance_price` decimal(10,2) DEFAULT NULL COMMENT '联盟底价(仅在组合套餐时生效)',
  `unit` varchar(20) NOT NULL COMMENT '单位(如: 斤, 个, 把)',
  `stock` int(11) DEFAULT '-1' COMMENT '库存: -1表示不限',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态: 0-下架, 1-上架',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';


-- ----------------------------
-- 3. 交易与订单模块 (统配模式)
-- ----------------------------

-- 总订单表 (用户支付维度)
CREATE TABLE `ord_main` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(64) NOT NULL COMMENT '总订单号',
  `user_id` bigint(20) NOT NULL COMMENT '下单用户ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额(商品+运费)',
  `goods_amount` decimal(10,2) NOT NULL COMMENT '商品总金额',
  `freight_amount` decimal(10,2) NOT NULL COMMENT '统配运费一口价',
  `address_id` bigint(20) NOT NULL COMMENT '收货地址ID',
  `delivery_batch` varchar(50) NOT NULL COMMENT '配送班次(如: 2023-10-25 上午班)',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态: 0-待支付, 1-待备货(已支付), 2-待配送(集散完成), 3-配送中, 4-已完成, 5-已取消',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户总订单表(含运费)';

-- 商家子订单表 (备货与分账维度)
CREATE TABLE `ord_sub` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `main_order_id` bigint(20) NOT NULL COMMENT '关联总订单ID',
  `sub_order_no` varchar(64) NOT NULL COMMENT '子订单号',
  `merchant_id` bigint(20) NOT NULL COMMENT '所属商家ID',
  `goods_amount` decimal(10,2) NOT NULL COMMENT '该商家的商品总额',
  `settle_amount` decimal(10,2) NOT NULL COMMENT '商家实际应结金额(扣除平台可能服务费)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1-待备货, 2-已备货(等待骑手取), 3-已取走, 4-已完结分账',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家备货子订单表';

-- 订单明细表
CREATE TABLE `ord_item` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `sub_order_id` bigint(20) NOT NULL COMMENT '关联子订单ID',
  `product_id` bigint(20) NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品快照名称',
  `product_image` varchar(255) DEFAULT NULL COMMENT '商品快照图片',
  `price` decimal(10,2) NOT NULL COMMENT '购买时单价',
  `quantity` int(11) NOT NULL COMMENT '购买数量',
  `total_price` decimal(10,2) NOT NULL COMMENT '小计金额',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细表';


-- ----------------------------
-- 4. 熟人顺风车互助模块
-- ----------------------------

-- 行程表
CREATE TABLE `carpool_trip` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '发布人ID',
  `village_id` bigint(20) NOT NULL COMMENT '所属出行圈(村落)ID，严格隔离',
  `trip_role` tinyint(1) NOT NULL COMMENT '角色: 1-车找人(司机), 2-人找车(乘客)',
  `scene_type` varchar(50) NOT NULL COMMENT '场景标签(老人就医/儿童接送/镇上赶集)',
  `depart_time` datetime NOT NULL COMMENT '预计出发时间',
  `start_point` varchar(100) NOT NULL COMMENT '起点',
  `end_point` varchar(100) NOT NULL COMMENT '终点',
  `seats` int(11) NOT NULL COMMENT '提供座位数/需要座位数',
  `fee_type` tinyint(1) DEFAULT '1' COMMENT '费用模式: 0-免费互助, 1-固定分摊, 2-随喜红包',
  `fee_amount` decimal(10,2) DEFAULT '0.00' COMMENT '固定分摊金额(如有)',
  `remark` varchar(255) DEFAULT NULL COMMENT '特殊要求备注(如带农具/轮椅)',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态: 0-拼车中, 1-已满员/已匹配, 2-行程中, 3-已完成, 4-已取消',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='顺风车行程发布表';

SET FOREIGN_KEY_CHECKS = 1;