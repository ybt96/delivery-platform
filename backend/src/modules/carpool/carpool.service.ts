import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CarpoolProfile } from './entities/carpool-profile.entity';
import { CarpoolTrip } from './entities/carpool-trip.entity';
import { CarpoolBooking } from './entities/carpool-booking.entity';
import { CreateCarpoolProfileDto, CreateCarpoolTripDto, CreateCarpoolBookingDto } from './dto/carpool.dto';

/**
 * 顺风车服务
 */
@Injectable()
export class CarpoolService {
  constructor(
    @InjectRepository(CarpoolProfile)
    private readonly profileRepository: Repository<CarpoolProfile>,
    @InjectRepository(CarpoolTrip)
    private readonly tripRepository: Repository<CarpoolTrip>,
    @InjectRepository(CarpoolBooking)
    private readonly bookingRepository: Repository<CarpoolBooking>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建/更新顺风车用户认证信息
   * @param userId 用户ID
   * @param createCarpoolProfileDto 认证信息
   */
  async createProfile(userId: number, createCarpoolProfileDto: CreateCarpoolProfileDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let profile = await this.profileRepository.findOne({ where: { userId } });

      if (profile) {
        Object.assign(profile, createCarpoolProfileDto);
      } else {
        profile = this.profileRepository.create({
          userId,
          ...createCarpoolProfileDto,
        });
      }

      const savedProfile = await queryRunner.manager.save(CarpoolProfile, profile);
      await queryRunner.commitTransaction();
      return savedProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户顺风车认证信息
   * @param userId 用户ID
   */
  async getProfile(userId: number) {
    return this.profileRepository.findOne({ where: { userId } });
  }

  /**
   * 发布顺风车行程
   * @param driverId 车主ID
   * @param createCarpoolTripDto 行程信息
   */
  async createTrip(driverId: number, createCarpoolTripDto: CreateCarpoolTripDto) {
    // 检查车主认证状态
    const profile = await this.profileRepository.findOne({
      where: { userId: driverId, verifyStatus: 1 }
    });
    if (!profile || profile.role !== 1 && profile.role !== 3) {
      throw new Error('车主未通过认证或无车主权限');
    }

    const trip = this.tripRepository.create({
      driverId,
      ...createCarpoolTripDto,
      availableSeats: createCarpoolTripDto.totalSeats,
    });

    return this.tripRepository.save(trip);
  }

  /**
   * 查询顺风车行程列表
   * @param options 查询选项
   */
  async findTrips(options?: {
    skip?: number;
    take?: number;
    village?: string;
    departureTime?: Date;
    status?: number;
  }) {
    const { skip = 0, take = 10, village, departureTime, status } = options || {};
    const where: any = {};

    if (village) where.village = village;
    if (departureTime) where.departureTime = departureTime;
    if (typeof status === 'number') where.status = status;

    return this.tripRepository.findAndCount({
      where,
      skip,
      take,
      order: { departureTime: 'ASC' },
    });
  }

  /**
   * 申请搭乘顺风车
   * @param passengerId 乘客ID
   * @param createCarpoolBookingDto 预约信息
   */
  async createBooking(passengerId: number, createCarpoolBookingDto: CreateCarpoolBookingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查行程是否存在且可预约
      const trip = await this.tripRepository.findOne({
        where: { id: createCarpoolBookingDto.tripId, status: 1 },
      });
      if (!trip) {
        throw new Error('行程不存在或不可预约');
      }

      // 检查剩余座位
      if (trip.availableSeats < createCarpoolBookingDto.seats!) {
        throw new Error('剩余座位不足');
      }

      // 创建预约记录
      const booking = this.bookingRepository.create({
        passengerId,
        ...createCarpoolBookingDto,
        status: 0, // 待确认
      });
      const savedBooking = await queryRunner.manager.save(CarpoolBooking, booking);

      // 更新行程剩余座位
      await this.tripRepository.decrement(
        { id: trip.id },
        'availableSeats',
        createCarpoolBookingDto.seats!,
      );

      await queryRunner.commitTransaction();
      return savedBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户预约记录
   * @param passengerId 乘客ID
   * @param status 状态
   */
  async getUserBookings(passengerId: number, status?: number) {
    const where: any = { passengerId };
    if (typeof status === 'number') {
      where.status = status;
    }

    return this.bookingRepository.findAndCount({
      where,
      relations: ['trip'],
      order: { createdAt: 'DESC' },
    });
  }
}