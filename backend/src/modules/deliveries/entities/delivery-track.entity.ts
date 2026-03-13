import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { DeliveryTask } from './delivery-task.entity';

/**
 * 配送轨迹实体
 */
@Entity('delivery_tracks')
export class DeliveryTrack {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ comment: '配送任务ID' })
  taskId: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, comment: '纬度' })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, comment: '经度' })
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '速度(km/h)' })
  speed: number;

  @Column({ type: 'datetime', comment: '记录时间' })
  @CreateDateColumn()
  recordedAt: Date;

  // 关联关系
  @ManyToOne(() => DeliveryTask, (task) => task.tracks)
  task: DeliveryTask;
}