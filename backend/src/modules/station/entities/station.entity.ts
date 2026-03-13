import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StationDelivery } from './station-delivery.entity';
import { PurchaseOrder } from './purchase-order.entity';

/**
 * 服务站实体
 */
@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 100, comment: '服务站名称' })
  name: string;

  @Column({ comment: '站长用户ID' })
  userId: number;

  @Column({ length: 255, comment: '服务站地址' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '纬度' })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '经度' })
  longitude: number;

  @Column({ length: 20, comment: '联系电话' })
  phone: string;

  @Column({ length: 50, comment: '服务站类型' })
  type: string;

  @Column({ length: 255, nullable: true, comment: '服务覆盖范围' })
  serviceArea: string;

  @Column({ length: 100, comment: '营业时间' })
  businessHours: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0停用 1启用' })
  status: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => StationDelivery, (delivery) => delivery.station)
  deliveries: StationDelivery[];

  @OneToMany(() => PurchaseOrder, (order) => order.station)
  purchaseOrders: PurchaseOrder[];
}