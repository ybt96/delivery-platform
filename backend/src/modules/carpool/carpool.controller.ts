import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CarpoolService } from './carpool.service';
import { CreateCarpoolProfileDto, CreateCarpoolTripDto, CreateCarpoolBookingDto } from './dto/carpool.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

/**
 * 顺风车控制器
 */
@Controller('api/v1/carpool')
export class CarpoolController {
  constructor(private readonly carpoolService: CarpoolService) {}

  /**
   * 创建/更新顺风车用户认证信息
   */
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  createProfile(
    @Request() req,
    @Body() createCarpoolProfileDto: CreateCarpoolProfileDto,
  ) {
    return this.carpoolService.createProfile(
      req.user.userId,
      createCarpoolProfileDto,
    );
  }

  /**
   * 获取用户顺风车认证信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.carpoolService.getProfile(req.user.userId);
  }

  /**
   * 发布顺风车行程（车主）
   */
  @UseGuards(JwtAuthGuard)
  @Post('trips')
  createTrip(
    @Request() req,
    @Body() createCarpoolTripDto: CreateCarpoolTripDto,
  ) {
    return this.carpoolService.createTrip(
      req.user.userId,
      createCarpoolTripDto,
    );
  }

  /**
   * 查询顺风车行程列表
   */
  @Get('trips')
  findTrips(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('village') village?: string,
    @Query('departureTime') departureTime?: Date,
  ) {
    return this.carpoolService.findTrips({ skip, take, village, departureTime });
  }

  /**
   * 申请搭乘顺风车（乘客）
   */
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(
    @Request() req,
    @Body() createCarpoolBookingDto: CreateCarpoolBookingDto,
  ) {
    return this.carpoolService.createBooking(
      req.user.userId,
      createCarpoolBookingDto,
    );
  }

  /**
   * 获取用户预约记录
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  getMyBookings(@Request() req, @Query('status') status?: number) {
    return this.carpoolService.getUserBookings(req.user.userId, status);
  }
}