import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

/**
 * 商品服务
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建商品
   * @param createProductDto 创建信息
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  /**
   * 查询商品详情
   * @param id 商品ID
   */
  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  /**
   * 查询商品列表
   * @param options 查询选项
   */
  async findAndCount(options?: {
    skip?: number;
    take?: number;
    where?: any;
    relations?: string[];
  }): Promise<[Product[], number]> {
    const { skip = 0, take = 10, where = {}, relations = [] } = options || {};
    return this.productRepository.findAndCount({
      where,
      relations,
      skip,
      take,
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 更新商品
   * @param id 商品ID
   * @param data 更新数据
   */
  async update(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new Error('商品不存在');
    }
    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  /**
   * 删除商品
   * @param id 商品ID
   */
  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  /**
   * 搜索商品
   * @param keyword 关键词
   * @param options 查询选项
   */
  async search(
    keyword: string,
    options?: { skip?: number; take?: number },
  ): Promise<[Product[], number]> {
    const { skip = 0, take = 10 } = options || {};
    return this.productRepository.findAndCount({
      where: {
        name: Like(`%${keyword}%`),
        status: 1,
      },
      skip,
      take,
      order: { sales: 'DESC' },
    });
  }
}