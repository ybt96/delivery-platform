import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Deliverer } from './deliverer.entity';
import { DeliveryTrack } from './delivery-track.entity';

/**
 * 配送任务实体
 */
@Entity('delivery_tasks')
export class DeliveryTask {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '关联订单ID' })
  orderId: number;

  @Column({ nullable: true, comment: '配送员ID' })
  delivererId: number;

  @Column({ length: 255, comment: '取货地址（商家地址）' })
  pickupAddress: string;

  @Column({ length: 255, comment: '配送地址（用户地址）' })
  deliverAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '取货点纬度' })
  pickupLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '取货点经度' })
  pickupLng: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '配送点纬度' })
  deliverLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '配送点经度' })
  deliverLng: number;

  @Column({ type: 'datetime', nullable: true, comment: '预约配送时间' })
  appointmentTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '取货时间' })
  pickupTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '送达时间' })
  deliveredTime: Date;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0待接单 1已接单 2取货中 3配送中 4已送达' })
  status: number;

  @Column({ length: 255, nullable: true, comment: '签收图片' })
  signImg: string;

  @Column({ length: 255, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.deliveryTasks)
  order: Order;

  @ManyToOne(() => Deliverer, (deliverer) => deliverer.tasks)
  deliverer: Deliverer;

  @OneToMany(() => DeliveryTrack, (track) => track.task)
  tracks: DeliveryTrack[];
}