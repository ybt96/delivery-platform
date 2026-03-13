import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Order } from './order.entity';

/**
 * 支付记录实体
 */
@Entity('payment_records')
export class PaymentRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ length: 32, comment: '订单号' })
  orderNo: string;

  @Column({ length: 64, nullable: true, comment: '第三方支付流水号' })
  transactionId: string;

  @Column({ type: 'tinyint', comment: '支付方式 1微信 2支付宝' })
  payType: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '支付金额' })
  amount: number;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0待支付 1成功 2失败 3退款' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '支付完成时间' })
  paidAt: Date;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;
}