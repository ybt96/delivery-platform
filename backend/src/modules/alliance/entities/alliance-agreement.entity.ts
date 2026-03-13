import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

/**
 * 联盟协议实体
 */
@Entity('alliance_agreements')
export class AllianceAgreement {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '商家ID' })
  merchantId: number;

  @Column({ type: 'datetime', comment: '签署时间' })
  signTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '协议到期时间' })
  expireTime: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, comment: '承诺折扣率（如 0.95 = 九五折）' })
  discountRate: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0失效 1有效' })
  status: number;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => Merchant, (merchant) => merchant.allianceAgreement)
  merchant: Merchant;
}