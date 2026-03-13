import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Station } from './station.entity';

/**
 * 站点配送实体
 */
@Entity('station_deliveries')
export class StationDelivery {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '服务站ID' })
  stationId: number;

  @Column({ length: 50, comment: '订单号' })
  orderNo: string;

  @Column({ length: 50, comment: '村民姓名' })
  villagerName: string;

  @Column({ length: 20, comment: '村民手机' })
  villagerPhone: string;

  @Column({ length: 255, comment: '配送地址' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品金额' })
  productAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '配送费' })
  deliveryFee: number;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0待配送 1配送中 2已完成' })
  status: number;

  @Column({ type: 'tinyint', default: 1, comment: '服务距离范围' })
  distanceRange: number;

  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completedAt: Date;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Station, (station) => station.deliveries)
  @JoinColumn({ name: 'stationId' })
  station: Station;
}