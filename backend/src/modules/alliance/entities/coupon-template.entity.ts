import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserCoupon } from './user-coupon.entity';

/**
 * 优惠券模板实体
 */
@Entity('coupon_templates')
export class CouponTemplate {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true, comment: '商家ID，NULL表示平台通用券' })
  merchantId: number;

  @Column({ length: 100, comment: '优惠券名称' })
  name: string;

  @Column({ type: 'tinyint', comment: '类型 1满减 2折扣 3代金券' })
  type: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '面值（代金券金额 / 满减金额）' })
  faceValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低消费金额' })
  minAmount: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, comment: '折扣率（折扣券，如 0.8=八折）' })
  discountRate: number;

  @Column({ type: 'int', comment: '发行总量' })
  total: number;

  @Column({ type: 'int', default: 0, comment: '已领取数量' })
  received: number;

  @Column({ type: 'int', default: 0, comment: '已使用数量' })
  used: number;

  @Column({ type: 'datetime', comment: '活动开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '活动结束时间' })
  endTime: Date;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0下架 1正常' })
  status: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => UserCoupon, (userCoupon) => userCoupon.template)
  userCoupons: UserCoupon[];
}