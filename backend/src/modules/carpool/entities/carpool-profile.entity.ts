import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CarpoolTrip } from './carpool-trip.entity';
import { CarpoolBooking } from './carpool-booking.entity';

/**
 * 顺风车用户认证实体
 */
@Entity('carpool_profiles')
export class CarpoolProfile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '关联用户ID' })
  userId: number;

  @Column({ type: 'tinyint', comment: '角色 1车主 2乘客 3两者都是' })
  role: number;

  // 车主专属字段
  @Column({ length: 100, nullable: true, comment: '驾照编号（加密）' })
  driverLicense: string;

  @Column({ length: 255, nullable: true, comment: '驾照图片' })
  licenseImg: string;

  @Column({ length: 50, nullable: true, comment: '车辆品牌' })
  vehicleBrand: string;

  @Column({ length: 20, nullable: true, comment: '车辆颜色' })
  vehicleColor: string;

  @Column({ length: 20, nullable: true, comment: '车牌号' })
  vehiclePlate: string;

  @Column({ length: 255, nullable: true, comment: '车辆照片' })
  vehicleImg: string;

  @Column({ type: 'int', default: 3, comment: '最大载客人数' })
  maxPassengers: number;

  // 乘客专属字段
  @Column({ length: 255, nullable: true, comment: '特殊需求' })
  specialNeeds: string;

  // 社区认证
  @Column({ length: 100, nullable: true, comment: '所在村庄/小区' })
  village: string;

  @Column({ type: 'tinyint', default: 0, comment: '社区认证 0未认证 1已认证' })
  villageVerified: number;

  @Column({ type: 'tinyint', default: 0, comment: '认证状态 0待审核 1通过 2拒绝' })
  verifyStatus: number;

  @Column({ length: 255, nullable: true, comment: '拒绝原因' })
  rejectReason: string;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.carpoolProfiles)
  user: User;

  @OneToMany(() => CarpoolTrip, (trip) => trip.driver)
  trips: CarpoolTrip[];

  @OneToMany(() => CarpoolBooking, (booking) => booking.passenger)
  bookings: CarpoolBooking[];
}