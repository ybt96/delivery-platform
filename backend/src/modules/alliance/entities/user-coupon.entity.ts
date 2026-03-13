import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CouponTemplate } from './coupon-template.entity';

/**
 * 用户领券记录实体
 */
@Entity('user_coupons')
export class UserCoupon {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '优惠券模板ID' })
  templateId: number;

  @Column({ nullable: true, comment: '使用时关联的订单ID' })
  orderId: number;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0未使用 1已使用 2已过期' })
  status: number;

  @Column({ type: 'datetime', comment: '领券时间' })
  @CreateDateColumn()
  receivedAt: Date;

  @Column({ type: 'datetime', nullable: true, comment: '使用时间' })
  usedAt: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.userCoupons)
  user: User;

  @ManyToOne(() => CouponTemplate, (template) => template.userCoupons)
  template: CouponTemplate;
}