import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

/**
 * 订单商品明细实体
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '商品ID' })
  productId: number;

  @Column({ length: 100, comment: '商品名称（快照）' })
  productName: string;

  @Column({ length: 255, nullable: true, comment: '商品图片（快照）' })
  productImg: string;

  @Column({ length: 100, nullable: true, comment: '规格名称（快照）' })
  specName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单价（快照）' })
  unitPrice: number;

  @Column({ type: 'int', comment: '购买数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '小计金额' })
  subtotal: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  product: Product;
}