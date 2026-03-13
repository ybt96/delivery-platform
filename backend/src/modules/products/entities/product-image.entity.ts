import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * 商品图片实体
 */
@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '商品ID' })
  productId: number;

  @Column({ length: 255, comment: '图片URL' })
  url: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}