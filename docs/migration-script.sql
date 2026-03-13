-- ============================================================
-- 数据库统一迁移脚本
-- 说明：将旧表数据迁移至新表结构，保留旧表作为备份
-- 日期：2026-03-13
-- ============================================================

USE xianglixtangqin;

-- ============================================================
-- 1. 用户表迁移
-- ============================================================

-- 检查用户表结构
DESCRIBE sys_user;
DESCRIBE users;

-- 迁移用户数据（从 sys_user 到 users）
-- 注意：这里需要根据实际需求调整用户名生成逻辑
INSERT INTO users (
  wx_openid,
  username,
  password,
  phone,
  realName,
  idCard,
  avatar,
  gender,
  status,
  isVerified,
  role,
  villageId,
  createdAt,
  update_time
)
SELECT
  wx_openid,
  CONCAT('user_', id) AS username,
  SHA2(CONCAT(wx_openid, 'xiangli_dev_secret'), 256) AS password,
  phone,
  real_name AS realName,
  NULL AS idCard,
  avatar_url AS avatar,
  0 AS gender,
  1 AS status,
  is_certified AS isVerified,
  CASE
    WHEN role_type = 1 THEN 'consumer'
    WHEN role_type = 2 THEN 'merchant'
    WHEN role_type = 3 THEN 'deliverer'
    WHEN role_type = 4 THEN 'admin'
    ELSE 'consumer'
  END AS role,
  village_id AS villageId,
  create_time AS createdAt,
  update_time
FROM sys_user
WHERE wx_openid IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.wx_openid = sys_user.wx_openid
  );

-- ============================================================
-- 2. 商家表迁移
-- ============================================================

-- 检查商家表结构
DESCRIBE biz_merchant;
DESCRIBE merchants;

-- 迁移商家数据（从 biz_merchant 到 merchants）
INSERT INTO merchants (
  userId,
  name,
  categoryId,
  description,
  logo,
  banner,
  address,
  latitude,
  longitude,
  phone,
  businessHours,
  licenseImg,
  status,
  rating,
  reviewCount,
  createdAt,
  updatedAt
)
SELECT
  owner_user_id AS userId,
  shop_name AS name,
  NULL AS categoryId, -- 旧表中没有category_id，只有category
  NULL AS description,
  NULL AS logo,
  NULL AS banner,
  address,
  longitude,
  latitude,
  '' AS phone,
  NULL AS businessHours,
  NULL AS licenseImg,
  status,
  5.00 AS rating,
  0 AS reviewCount,
  create_time AS createdAt,
  NOW() AS updatedAt
FROM biz_merchant
WHERE NOT EXISTS (
  SELECT 1 FROM merchants m WHERE m.userId = biz_merchant.owner_user_id
);

-- ============================================================
-- 3. 商品表迁移
-- ============================================================

-- 检查商品表结构
DESCRIBE biz_product;
DESCRIBE products;

-- 迁移商品数据（从 biz_product 到 products）
INSERT INTO products (
  merchantId,
  categoryId,
  name,
  description,
  coverImage,
  price,
  originalPrice,
  priceMin,
  priceMax,
  stock,
  sales,
  unit,
  rating,
  reviewCount,
  isDelivery,
  isAlliance,
  status,
  sort,
  createdAt,
  updatedAt
)
SELECT
  merchant_id AS merchantId,
  category_id AS categoryId,
  name,
  description,
  image_url AS coverImage,
  price,
  alliance_price AS originalPrice,
  NULL AS priceMin,
  NULL AS priceMax,
  stock,
  0 AS sales,
  unit,
  5.00 AS rating,
  0 AS reviewCount,
 1 AS isDelivery,
  is_alliance AS isAlliance,
  status,
  0 AS sort,
  create_time AS createdAt,
  NOW() AS updatedAt
FROM biz_product
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.merchantId = biz_product.merchant_id
    AND p.name = biz_product.name
);

-- ============================================================
-- 4. 订单表迁移
-- ============================================================

-- 检查订单表结构
DESCRIBE ord_main;
DESCRIBE orders;

-- 迁移订单主表数据（从 ord_main 到 orders）
INSERT INTO orders (
  orderNo,
  userId,
  merchantId,
  delivererId,
  addressId,
  totalAmount,
  discountAmount,
  deliveryFee,
  payAmount,
  payType,
  payTime,
  status,
  remark,
  cancelReason,
  appointmentTime,
  createdAt,
  updatedAt
)
SELECT
  order_no AS orderNo,
  user_id AS userId,
  NULL AS merchantId, -- 旧表中没有商家ID
  NULL AS delivererId,
  address_id AS addressId,
  total_amount AS totalAmount,
  0 AS discountAmount,
  freight_amount AS deliveryFee,
  total_amount AS payAmount,
  NULL AS payType,
  pay_time AS payTime,
  status,
  NULL AS remark,
  NULL AS cancelReason,
  NULL AS appointmentTime,
  create_time AS createdAt,
  NOW() AS updatedAt
FROM ord_main
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.orderNo = ord_main.order_no
);

-- ============================================================
-- 5. 订单明细表迁移
-- ============================================================

-- 检查订单明细表结构
DESCRIBE ord_item;
DESCRIBE order_items;

-- 迁移订单明细数据（从 ord_item 到 order_items）
INSERT INTO order_items (
  orderId,
  productId,
  productName,
  productImg,
  specName,
  unitPrice,
  quantity,
  subtotal,
  createdAt
)
SELECT
  sub_order_id AS orderId,
  product_id AS productId,
  product_name AS productName,
  product_image AS productImg,
  NULL AS specName,
  price AS unitPrice,
  quantity,
  total_price AS subtotal,
  NOW() AS createdAt
FROM ord_item
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.orderId = ord_item.sub_order_id
    AND oi.productId = ord_item.product_id
);

-- ============================================================
-- 6. 验证迁移结果
-- ============================================================

-- 检查用户数量
SELECT '旧用户表数量' AS source, COUNT(*) AS count FROM sys_user
UNION ALL
SELECT '新用户表数量' AS source, COUNT(*) AS count FROM users;

-- 检查商家数量
SELECT '旧商家表数量' AS source, COUNT(*) AS count FROM biz_merchant
UNION ALL
SELECT '新商家表数量' AS source, COUNT(*) AS count FROM merchants;

-- 检查商品数量
SELECT '旧商品表数量' AS source, COUNT(*) AS count FROM biz_product
UNION ALL
SELECT '新商品表数量' AS source, COUNT(*) AS count FROM products;

-- 检查订单数量
SELECT '旧订单表数量' AS source, COUNT(*) AS count FROM ord_main
UNION ALL
SELECT '新订单表数量' AS source, COUNT(*) AS count FROM orders;

-- ============================================================
-- 7. 创建缺失的表（如果需要）
-- ============================================================

-- 村落信息表（如果不存在）
CREATE TABLE IF NOT EXISTS villages (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '村落ID',
  name VARCHAR(100) NOT NULL COMMENT '村落名称',
  town_name VARCHAR(100) NOT NULL COMMENT '所属乡镇',
  status TINYINT DEFAULT '1' COMMENT '状态 0停用 1启用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='村落/社区信息表';

-- 用户地址表（如果不存在）
CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
  province VARCHAR(50) DEFAULT NULL COMMENT '省份',
  city VARCHAR(50) DEFAULT NULL COMMENT '城市',
  district VARCHAR(50) DEFAULT NULL COMMENT '区县',
  address VARCHAR(255) NOT NULL COMMENT '详细地址',
  village_id BIGINT DEFAULT NULL COMMENT '所属村落ID',
  is_default TINYINT DEFAULT '0' COMMENT '是否默认 0否 1是',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  KEY idx_village (village_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- ============================================================
-- 8. 添加缺失的索引
-- ============================================================

-- users 表索引
ALTER TABLE users ADD INDEX idx_role (role) IF NOT EXISTS;
ALTER TABLE users ADD INDEX idx_village_id (village_id) IF NOT EXISTS;

-- merchants 表索引
ALTER TABLE merchants ADD INDEX idx_user_id (user_id) IF NOT EXISTS;
ALTER TABLE merchants ADD INDEX idx_status (status) IF NOT EXISTS;
ALTER TABLE merchants ADD INDEX idx_category_id (categoryId) IF NOT EXISTS;

-- products 表索引
ALTER TABLE products ADD INDEX idx_merchant_id (merchantId) IF NOT EXISTS;
ALTER TABLE products ADD INDEX idx_category_id (categoryId) IF NOT EXISTS;
ALTER TABLE products ADD INDEX idx_status (status) IF NOT EXISTS;

-- orders 表索引
ALTER TABLE orders ADD INDEX idx_user_id (userId) IF NOT EXISTS;
ALTER TABLE orders ADD INDEX idx_merchant_id (merchantId) IF NOT EXISTS;
ALTER TABLE orders ADD INDEX idx_status (status) IF NOT EXISTS;
ALTER TABLE orders ADD INDEX idx_order_no (orderNo) IF NOT EXISTS;

-- order_items 表索引
ALTER TABLE order_items ADD INDEX idx_order_id (orderId) IF NOT EXISTS;
ALTER TABLE order_items ADD INDEX idx_product_id (productId) IF NOT EXISTS;

-- ============================================================
-- 9. 创建测试用户（用于开发测试）
-- ============================================================

-- 如果还没有管理员用户，创建一个
INSERT INTO users (wx_openid, username, password, phone, role, status, createdAt)
SELECT 'admin_openid', 'admin', SHA2('admin123', 256), '13800138000', 'admin', 1, NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'admin'
);

-- ============================================================
-- 10. 创建默认村落
-- ============================================================

INSERT INTO villages (name, town_name, status)
SELECT '白杨村', 'XX镇', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM villages WHERE name = '白杨村'
);

INSERT INTO villages (name, town_name, status)
SELECT '幸福社区', 'XX镇', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM villages WHERE name = '幸福社区'
);

-- ============================================================
-- 迁移完成
-- ============================================================
