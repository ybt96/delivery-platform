import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { AllianceAgreement } from '../../alliance/entities/alliance-agreement.entity';

/**
 * 商家实体
 */
@Entity('merchants')
export class Merchant {
  @ApiProperty({ description: '商家ID' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '关联用户ID' })
  @Column({ comment: '关联用户ID' })
  userId: number;

  @ApiProperty({ description: '店铺名称' })
  @Column({ length: 100, comment: '店铺名称' })
  name: string;

  @ApiProperty({ description: '分类ID', required: false })
  @Column({ nullable: true, comment: '分类ID' })
  categoryId: number;

  @ApiProperty({ description: '店铺简介', required: false })
  @Column({ type: 'text', nullable: true, comment: '店铺简介' })
  description: string;

  @ApiProperty({ description: '店铺Logo', required: false })
  @Column({ length: 255, nullable: true, comment: '店铺Logo' })
  logo: string;

  @ApiProperty({ description: '店铺横幅图', required: false })
  @Column({ length: 255, nullable: true, comment: '店铺横幅图' })
  banner: string;

  @ApiProperty({ description: '店铺地址' })
  @Column({ length: 255, comment: '店铺地址' })
  address: string;

  @ApiProperty({ description: '纬度', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '纬度' })
  latitude: number;

  @ApiProperty({ description: '经度', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '经度' })
  longitude: number;

  @ApiProperty({ description: '联系电话' })
  @Column({ length: 20, comment: '联系电话' })
  phone: string;

  @ApiProperty({ description: '营业时间', required: false })
  @Column({ length: 100, nullable: true, comment: '营业时间' })
  businessHours: string;

  @ApiProperty({ description: '营业执照图片', required: false })
  @Column({ length: 255, nullable: true, comment: '营业执照图片' })
  licenseImg: string;

  @ApiProperty({ description: '状态 0待审核 1正常 2违规封禁' })
  @Column({ type: 'tinyint', default: 0, comment: '状态 0待审核 1正常 2违规封禁' })
  status: number;

  @ApiProperty({ description: '综合评分' })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0, comment: '综合评分' })
  rating: number;

  @ApiProperty({ description: '评价总数' })
  @Column({ type: 'int', default: 0, comment: '评价总数' })
  reviewCount: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Product, (product) => product.merchant)
  products: Product[];

  @OneToMany(() => Order, (order) => order.merchant)
  orders: Order[];

  @OneToOne(() => AllianceAgreement, (agreement) => agreement.merchant)
  allianceAgreement: AllianceAgreement;
}