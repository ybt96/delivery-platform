import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

/**
 * 订单服务
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建订单
   * @param createOrderDto 创建信息
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.orderRepository.create(createOrderDto);
      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询订单详情
   * @param id 订单ID
   */
  async findOne(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id } });
  }

  /**
   * 查询用户订单列表
   * @param userId 用户ID
   * @param options 查询选项
   */
  async findByUser(
    userId: number,
    options?: { skip?: number; take?: number; status?: number },
  ): Promise<[Order[], number]> {
    const { skip = 0, take = 10, status } = options || {};
    const where: any = { userId };

    if (typeof status === 'number') {
      where.status = status;
    }

    return this.orderRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询商家订单列表
   * @param merchantId 商家ID
   * @param options 查询选项
   */
  async findByMerchant(
    merchantId: number,
    options?: { skip?: number; take?: number; status?: number },
  ): Promise<[Order[], number]> {
    const { skip = 0, take = 10, status } = options || {};
    const where: any = { merchantId };

    if (typeof status === 'number') {
      where.status = status;
    }

    return this.orderRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 更新订单
   * @param id 订单ID
   * @param data 更新数据
   */
  async update(id: number, data: Partial<Order>): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new Error('订单不存在');
    }
    Object.assign(order, data);
    return this.orderRepository.save(order);
  }

  /**
   * 统计订单数据
   * @param merchantId 商家ID
   */
  async countStats(merchantId: number) {
    const stats = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN order.status = 0 THEN 1 ELSE 0 END)", 'pending')
      .addSelect("SUM(CASE WHEN order.status = 1 THEN 1 ELSE 0 END)", 'paid')
      .addSelect("SUM(CASE WHEN order.status = 3 THEN 1 ELSE 0 END)", 'delivering')
      .addSelect("SUM(CASE WHEN order.status = 4 THEN 1 ELSE 0 END)", 'completed')
      .where('order.merchantId = :merchantId', { merchantId })
      .getRawOne();

    return stats;
  }
}