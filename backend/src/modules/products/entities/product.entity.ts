import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ProductImage } from './product-image.entity';
import { ProductSpec } from './product-spec.entity';
// import { Review } from '../../reviews/entities/review.entity';

/**
 * 商品实体
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '所属商家ID' })
  merchantId: number;

  @Column({ comment: '分类ID' })
  categoryId: number;

  @Column({ length: 100, comment: '商品名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ length: 255, comment: '商品主图' })
  coverImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '当前售价' })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '划线原价',
  })
  originalPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '价格区间-最低',
  })
  priceMin: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '价格区间-最高',
  })
  priceMax: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已售数量' })
  sales: number;

  @Column({ length: 20, default: '件', comment: '单位' })
  unit: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0, comment: '评分' })
  rating: number;

  @Column({ type: 'int', default: 0, comment: '评价数' })
  reviewCount: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否支持配送 0否 1是' })
  isDelivery: number;

  @Column({ type: 'tinyint', default: 0, comment: '是否参与百商联盟优惠 0否 1是' })
  isAlliance: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0下架 1上架' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Merchant, (merchant) => merchant.products)
  merchant: Merchant;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ProductSpec, (spec) => spec.product)
  specs: ProductSpec[];

  // TODO: Review entity to be created
  // @OneToMany(() => Review, (review) => review.target)
  // reviews: Review[];
}