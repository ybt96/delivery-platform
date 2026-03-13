/**
 * 用户角色枚举
 */
export enum UserRole {
  CONSUMER = 'consumer',       // 消费者
  MERCHANT = 'merchant',       // 商家
  DELIVERER = 'deliverer',     // 配送员
  ADMIN = 'admin',             // 管理员
  CARPOOL_DRIVER = 'carpool_driver', // 顺风车车主
  CARPOOL_PASSENGER = 'carpool_passenger', // 顺风车乘客
}

/**
 * 角色权限矩阵
 */
export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.CONSUMER]: [
    'order:read',
    'order:create',
    'product:read',
    'review:create',
    'alliance:read',
    'carpool:search',
    'carpool:join',
    'address:manage',
    'coupon:receive',
  ],
  [UserRole.MERCHANT]: [
    'product:manage',
    'order:merchant:read',
    'order:merchant:update',
    'review:read',
    'stats:merchant',
    'alliance:join',
    'coupon:create',
    'address:manage',
  ],
  [UserRole.DELIVERER]: [
    'order:deliverer:read',
    'order:deliverer:update',
    'location:upload',
    'address:manage',
  ],
  [UserRole.ADMIN]: [
    'user:manage',
    'product:manage',
    'order:admin:read',
    'stats:all',
    'system:config',
    'merchant:approve',
    'carpool:admin',
  ],
  [UserRole.CARPOOL_DRIVER]: [
    'carpool:driver:create',
    'carpool:driver:update',
    'route:read',
    'address:manage',
  ],
  [UserRole.CARPOOL_PASSENGER]: [
    'carpool:search',
    'carpool:join',
    'route:read',
    'address:manage',
  ],
};
