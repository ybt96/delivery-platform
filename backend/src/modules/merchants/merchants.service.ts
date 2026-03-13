import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { CreateMerchantDto } from './dto/merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

/**
 * 商家服务
 */
@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private merchantsRepository: Repository<Merchant>,
  ) {}

  /**
   * 创建商家
   * @param createMerchantDto 创建商家信息
   */
  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    // 检查用户是否已创建商家
    const existingMerchant = await this.merchantsRepository.findOne({
      where: { userId: createMerchantDto.userId },
    });

    if (existingMerchant) {
      throw new HttpException('该用户已创建商家', HttpStatus.BAD_REQUEST);
    }

    const merchant = this.merchantsRepository.create(createMerchantDto);
    return this.merchantsRepository.save(merchant);
  }

  /**
   * 获取所有商家
   */
  async findAll(): Promise<Merchant[]> {
    return this.merchantsRepository.find();
  }

  /**
   * 根据ID获取商家
   * @param id 商家ID
   */
  async findOne(id: number): Promise<Merchant> {
    const merchant = await this.merchantsRepository.findOne({ where: { id } });
    if (!merchant) {
      throw new HttpException('商家不存在', HttpStatus.NOT_FOUND);
    }
    return merchant;
  }

  /**
   * 根据用户ID获取商家
   * @param userId 用户ID
   */
  async findByUserId(userId: number): Promise<Merchant> {
    const merchant = await this.merchantsRepository.findOne({ where: { userId } });
    if (!merchant) {
      throw new HttpException('商家不存在', HttpStatus.NOT_FOUND);
    }
    return merchant;
  }

  /**
   * 更新商家信息
   * @param id 商家ID
   * @param updateMerchantDto 更新信息
   */
  async update(id: number, updateMerchantDto: UpdateMerchantDto): Promise<Merchant> {
    const merchant = await this.findOne(id);
    Object.assign(merchant, updateMerchantDto);
    return this.merchantsRepository.save(merchant);
  }

  /**
   * 删除商家
   * @param id 商家ID
   */
  async remove(id: number): Promise<void> {
    const merchant = await this.findOne(id);
    await this.merchantsRepository.remove(merchant);
  }

  /**
   * 根据状态获取商家列表
   * @param status 状态
   */
  async findByStatus(status: number): Promise<Merchant[]> {
    return this.merchantsRepository.find({ where: { status } });
  }
}