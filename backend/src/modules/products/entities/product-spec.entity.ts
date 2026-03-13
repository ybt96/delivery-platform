import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * 商品规格实体
 */
@Entity('product_specs')
export class ProductSpec {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '商品ID' })
  productId: number;

  @Column({ length: 50, comment: '规格名（如：重量）' })
  specName: string;

  @Column({ length: 50, comment: '规格值（如：500g）' })
  specValue: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '该规格售价' })
  price: number;

  @Column({ type: 'int', default: 0, comment: '该规格库存' })
  stock: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Product, (product) => product.specs)
  product: Product;
}