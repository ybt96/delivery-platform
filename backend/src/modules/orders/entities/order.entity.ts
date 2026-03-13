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
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Deliverer } from '../../deliveries/entities/deliverer.entity';
import { OrderItem } from './order-item.entity';
import { PaymentRecord } from './payment-record.entity';
import { DeliveryTask } from '../../deliveries/entities/delivery-task.entity';

/**
 * 订单实体
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 32, unique: true, comment: '订单号' })
  orderNo: string;

  @Column({ comment: '下单用户ID' })
  userId: number;

  @Column({ comment: '商家ID' })
  merchantId: number;

  @Column({ nullable: true, comment: '配送员ID' })
  delivererId: number;

  @Column({ comment: '收货地址ID' })
  addressId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '订单总金额' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '优惠金额' })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '配送费' })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '实付金额' })
  payAmount: number;

  @Column({ type: 'tinyint', nullable: true, comment: '支付方式 1微信 2支付宝 3现金' })
  payType: number;

  @Column({ type: 'datetime', nullable: true, comment: '支付时间' })
  payTime: Date;

  @Column({ type: 'tinyint', default: 0, comment: '状态' })
  status: number;

  @Column({ length: 255, nullable: true, comment: '买家备注' })
  remark: string;

  @Column({ length: 255, nullable: true, comment: '取消原因' })
  cancelReason: string;

  @Column({ type: 'datetime', nullable: true, comment: '预约配送时间' })
  appointmentTime: Date;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Merchant, (merchant) => merchant.orders)
  merchant: Merchant;

  @ManyToOne(() => Deliverer)
  deliverer: Deliverer;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => PaymentRecord, (payment) => payment.order)
  payments: PaymentRecord[];

  @OneToMany(() => DeliveryTask, (task) => task.order)
  deliveryTasks: DeliveryTask[];
}