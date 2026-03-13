import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

/**
 * 用户服务
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 通过手机号查找用户
   * @param phone 手机号
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  /**
   * 通过ID查找用户
   * @param id 用户ID
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 创建用户
   * @param createUserDto 创建信息
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param data 更新数据
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  /**
   * 删除用户（软删除）
   * @param id 用户ID
   */
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  /**
   * 查询用户列表
   * @param options 查询选项
   */
  async findAndCount(options?: {
    skip?: number;
    take?: number;
    where?: any;
  }): Promise<[User[], number]> {
    const { skip = 0, take = 10, where = {} } = options || {};
    return this.userRepository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }
}