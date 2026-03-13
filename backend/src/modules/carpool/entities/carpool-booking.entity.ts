import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CarpoolTrip } from './carpool-trip.entity';

/**
 * 顺风车预约记录实体
 */
@Entity('carpool_bookings')
export class CarpoolBooking {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '行程ID' })
  tripId: number;

  @Column({ comment: '乘客用户ID' })
  passengerId: number;

  @Column({ type: 'int', default: 1, comment: '预约座位数' })
  seats: number;

  @Column({ length: 255, nullable: true, comment: '乘客上车地址' })
  pickupAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '上车点纬度' })
  pickupLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '上车点经度' })
  pickupLng: number;

  @Column({ type: 'tinyint', default: 1, comment: '乘客类型 1本人 2接送孩子 3陪老人就医' })
  passengerType: number;

  @Column({ length: 255, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0待确认 1车主已接受 2车主拒绝 3已完成 4已取消' })
  status: number;

  @Column({ length: 255, nullable: true, comment: '拒绝原因' })
  rejectReason: string;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.carpoolProfiles)
  passenger: User;

  @ManyToOne(() => CarpoolTrip, (trip) => trip.bookings)
  trip: CarpoolTrip;
}