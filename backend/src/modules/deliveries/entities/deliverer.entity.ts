import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DeliveryTask } from './delivery-task.entity';

/**
 * 配送员实体
 */
@Entity('deliverers')
export class Deliverer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '关联用户ID' })
  userId: number;

  @Column({ length: 50, comment: '配送员姓名' })
  name: string;

  @Column({ length: 20, comment: '联系电话' })
  phone: string;

  @Column({ length: 100, nullable: true, comment: '身份证号（加密）' })
  idCard: string;

  @Column({ length: 30, nullable: true, comment: '交通工具（电动车/三轮车/摩托车）' })
  vehicleType: string;

  @Column({ length: 30, nullable: true, comment: '车牌号' })
  vehicleNo: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0离线 1空闲 2配送中' })
  status: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0, comment: '评分' })
  rating: number;

  @Column({ type: 'int', default: 0, comment: '总配送单数' })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '当前纬度' })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, comment: '当前经度' })
  longitude: number;

  @Column({ type: 'datetime', nullable: true, comment: '位置最后更新时间' })
  locationAt: Date;

  @Column({ type: 'datetime', comment: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', comment: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => DeliveryTask, (task) => task.deliverer)
  tasks: DeliveryTask[];
}