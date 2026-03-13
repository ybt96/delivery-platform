import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AllianceAgreement } from './entities/alliance-agreement.entity';
import { CouponTemplate } from './entities/coupon-template.entity';
import { UserCoupon } from './entities/user-coupon.entity';
import { CreateCouponTemplateDto } from './dto/alliance.dto';

/**
 * 百商联盟服务
 */
@Injectable()
export class AllianceService {
  constructor(
    @InjectRepository(AllianceAgreement)
    private readonly agreementRepository: Repository<AllianceAgreement>,
    @InjectRepository(CouponTemplate)
    private readonly templateRepository: Repository<CouponTemplate>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 商家签署联盟协议
   * @param merchantId 商家ID
   * @param discountRate 折扣率
   */
  async signAgreement(merchantId: number, discountRate: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查是否已签署
      const existing = await this.agreementRepository.findOne({
        where: { merchantId },
      });
      if (existing) {
        throw new Error('已签署联盟协议');
      }

      // 签署协议
      const agreement = this.agreementRepository.create({
        merchantId,
        signTime: new Date(),
        discountRate,
        status: 1,
      });
      await queryRunner.manager.save(AllianceAgreement, agreement);

      await queryRunner.commitTransaction();
      return agreement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取商家联盟协议
   * @param merchantId 商家ID
   */
  async getAgreement(merchantId: number) {
    return this.agreementRepository.findOne({ where: { merchantId } });
  }

  /**
   * 创建优惠券模板
   * @param createCouponTemplateDto 创建信息
   */
  async createCouponTemplate(createCouponTemplateDto: CreateCouponTemplateDto) {
    const template = this.templateRepository.create(createCouponTemplateDto);
    return this.templateRepository.save(template);
  }

  /**
   * 查询优惠券列表
   * @param options 查询选项
   */
  async findCoupons(options?: {
    skip?: number;
    take?: number;
    merchantId?: number;
    status?: number;
  }) {
    const { skip = 0, take = 10, merchantId, status } = options || {};
    const where: any = {};

    if (merchantId) where.merchantId = merchantId;
    if (typeof status === 'number') where.status = status;

    return this.templateRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 领取优惠券
   * @param userId 用户ID
   * @param templateId 优惠券模板ID
   */
  async receiveCoupon(userId: number, templateId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查是否已领取
      const existing = await this.userCouponRepository.findOne({
        where: { userId, templateId, status: 0 },
      });
      if (existing) {
        throw new Error('已领取该优惠券');
      }

      // 检查库存
      const template = await this.templateRepository.findOne({
        where: { id: templateId, status: 1 },
      });
      if (!template) {
        throw new Error('优惠券不存在或已下架');
      }
      if (template.received >= template.total) {
        throw new Error('优惠券已领完');
      }

      // 创建领券记录
      const userCoupon = this.userCouponRepository.create({
        userId,
        templateId,
        status: 0,
      });
      await queryRunner.manager.save(UserCoupon, userCoupon);

      // 更新已领取数量
      await this.templateRepository.increment(
        { id: templateId },
        'received',
        1,
      );

      await queryRunner.commitTransaction();
      return userCoupon;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户优惠券列表
   * @param userId 用户ID
   * @param status 状态 0未使用 1已使用 2已过期
   */
  async getUserCoupons(
    userId: number,
    status?: number,
  ): Promise<[UserCoupon[], number]> {
    const where: any = { userId };
    if (typeof status === 'number') {
      where.status = status;
    }

    return this.userCouponRepository.findAndCount({
      where,
      relations: ['template'],
      order: { receivedAt: 'DESC' },
    });
  }
}