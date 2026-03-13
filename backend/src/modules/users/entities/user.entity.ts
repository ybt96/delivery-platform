import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../../common/constants/roles';
import { UserCoupon } from '../../alliance/entities/user-coupon.entity';
import { CarpoolProfile } from '../../carpool/entities/carpool-profile.entity';
import { CarpoolBooking } from '../../carpool/entities/carpool-booking.entity';
import { Order } from '../../orders/entities/order.entity';

/**
 * 用户实体
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ comment: '密码(加密存储)' })
  password: string;

  @Column({ length: 20, unique: true, comment: '手机号(加密存储)' })
  phone: string;

  @Column({ length: 50, nullable: true, comment: '真实姓名' })
  realName: string;

  @Column({ length: 100, nullable: true, comment: '身份证号(加密存储)' })
  idCard: string;

  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ type: 'tinyint', default: 0, comment: '性别 0未知 1男 2女' })
  gender: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0禁用 1正常' })
  status: number;

  @Column({ type: 'tinyint', default: 0, comment: '实名认证 0未认证 1已认证' })
  isVerified: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '角色' })
  role: UserRole;

  @Column({ type: 'datetime', comment: '注册时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系（延迟加载，避免循环依赖）
  // @OneToMany(() => Order, (order) => order.user)
  // orders: Order[];

  @OneToMany(() => UserCoupon, (userCoupon) => userCoupon.user)
  userCoupons: UserCoupon[];

  @OneToMany(() => CarpoolProfile, (profile) => profile.user)
  carpoolProfiles: CarpoolProfile[];

  @OneToMany(() => CarpoolBooking, (booking) => booking.passenger)
  carpoolBookings: CarpoolBooking[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}