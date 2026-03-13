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
 * 代购订单实体
 */
@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '服务站ID' })
  stationId: number;

  @Column({ length: 50, comment: '村民姓名' })
  villagerName: string;

  @Column({ length: 20, comment: '村民手机' })
  villagerPhone: string;

  @Column({ length: 255, comment: '村民地址' })
  villagerAddress: string;

  @Column({ length: 100, comment: '商品名称' })
  productName: string;

  @Column({ length: 20, comment: '购买平台' })
  platform: string;

  @Column({ length: 500, nullable: true, comment: '商品链接' })
  productLink: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品价格' })
  productPrice: number;

  @Column({ type: 'int', default: 1, comment: '购买数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '代购服务费' })
  serviceFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '总金额' })
  totalAmount: number;

  @Column({ length: 50, comment: '快递单号' })
  trackingNumber: string;

  @Column({ length: 255, nullable: true, comment: '商品截图' })
  productImage: string;

  @Column({ type: 'tinyint', default: 0, comment: '取货方式 0到站自提 1站长配送' })
  pickupMethod: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '末端配送费' })
  deliveryFee: number;

  @Column({ type: 'varchar', length: 20, comment: '付款方式' })
  paymentMethod: string;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0待采购 1采购中 2到货待提 3配送中 4已完成 5滞留' })
  status: number;

  @Column({ type: 'datetime', comment: '到货时间' })
  arrivalTime: Date;

  @Column({ length: 255, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Station, (station) => station.purchaseOrders)
  @JoinColumn({ name: 'stationId' })
  station: Station;
}