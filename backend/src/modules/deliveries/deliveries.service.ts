import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DeliveryTask } from './entities/delivery-task.entity';
import { CreateDeliveryTaskDto, UpdateDeliveryTaskDto } from './dto/delivery.dto';

/**
 * 配送服务
 */
@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(DeliveryTask)
    private readonly taskRepository: Repository<DeliveryTask>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建配送任务
   * @param createDeliveryTaskDto 创建信息
   */
  async create(createDeliveryTaskDto: CreateDeliveryTaskDto): Promise<DeliveryTask> {
    const task = this.taskRepository.create(createDeliveryTaskDto);
    return this.taskRepository.save(task);
  }

  /**
   * 查询配送任务详情
   * @param id 任务ID
   */
  async findOne(id: number): Promise<DeliveryTask | null> {
    return this.taskRepository.findOne({ where: { id } });
  }

  /**
   * 查询配送员任务列表
   * @param delivererId 配送员ID
   * @param options 查询选项
   */
  async findByDeliverer(
    delivererId: number,
    options?: { skip?: number; take?: number; status?: number },
  ): Promise<[DeliveryTask[], number]> {
    const { skip = 0, take = 10, status } = options || {};
    const where: any = { delivererId };

    if (typeof status === 'number') {
      where.status = status;
    }

    return this.taskRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询订单配送任务
   * @param orderId 订单ID
   */
  async findByOrder(orderId: number): Promise<DeliveryTask | null> {
    return this.taskRepository.findOne({ where: { orderId } });
  }

  /**
   * 更新配送任务
   * @param id 任务ID
   * @param data 更新数据
   */
  async update(id: number, data: Partial<DeliveryTask>): Promise<DeliveryTask> {
    const task = await this.findOne(id);
    if (!task) {
      throw new Error('配送任务不存在');
    }
    Object.assign(task, data);
    return this.taskRepository.save(task);
  }

  /**
   * 添加配送轨迹点
   * @param taskId 任务ID
   * @param trackData 轨迹数据
   */
  async addTrackPoint(taskId: number, trackData: any) {
    const task = await this.findOne(taskId);
    if (!task) {
      throw new Error('配送任务不存在');
    }

    // TODO: 创建轨迹点记录
    // const track = this.trackRepository.create({
    //   taskId,
    //   ...trackData,
    // });
    // return this.trackRepository.save(track);
  }

  /**
   * 获取配送轨迹
   * @param taskId 任务ID
   */
  async getTracks(taskId: number) {
    // TODO: 查询轨迹点列表
    // return this.trackRepository.find({
    //   where: { taskId },
    //   order: { recordedAt: 'ASC' },
    // });
  }
}