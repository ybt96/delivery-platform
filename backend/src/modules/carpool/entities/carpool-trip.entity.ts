import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CarpoolBooking } from './carpool-booking.entity';

/**
 * 顺风车行程实体
 */
@Entity('carpool_trips')
export class CarpoolTrip {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '车主用户ID' })
  driverId: number;

  @Column({ length: 100, comment: '发车所在村庄' })
  village: string;

  // 出发地
  @Column({ length: 255, comment: '出发地详细地址' })
  fromAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, comment: '出发地纬度' })
  fromLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, comment: '出发地经度' })
  fromLng: number;

  // 目的地
  @Column({ length: 255, comment: '目的地详细地址' })
  toAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, comment: '目的地纬度' })
  toLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, comment: '目的地经度' })
  toLng: number;

  @Column({ type: 'datetime', comment: '出发时间' })
  departureTime: Date;

  @Column({ type: 'int', comment: '剩余可搭乘人数' })
  availableSeats: number;

  @Column({ type: 'int', comment: '总可搭乘人数' })
  totalSeats: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0, comment: '每人费用' })
  pricePerSeat: number;

  @Column({ type: 'tinyint', default: 1, comment: '出行类型 1普通出行 2接送孩子 3老人就医 4其他' })
  tripType: number;

  @Column({ length: 255, nullable: true, comment: '行程说明' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1招募中 2已满员 3进行中 4已完成 5已取消' })
  status: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.carpoolProfiles)
  driver: User;

  @OneToMany(() => CarpoolBooking, (booking) => booking.trip)
  bookings: CarpoolBooking[];
}