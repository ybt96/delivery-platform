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
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

/**
 * 服务站控制器
 */
@Controller('api/v1/stations')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  /**
   * 申请成为服务站
   * @param createStationDto 服务站信息
   * @param req 请求对象
   */
  @UseGuards(JwtAuthGuard)
  @Post('apply')
  async apply(@Body() createStationDto: CreateStationDto, @Request() req) {
    return this.stationService.apply(createStationDto, req.user.userId);
  }

  /**
   * 获取附近服务站列表
   * @param latitude 纬度
   * @param longitude 经度
   */
  @Get('nearby')
  async getNearbyStations(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return this.stationService.getNearbyStations(latitude, longitude);
  }

  /**
   * 获取服务站详情
   * @param id 服务站ID
   */
  @Get(':id')
  async getStationDetail(@Param('id') id: number) {
    return this.stationService.getStationDetail(id);
  }

  /**
   * 站长创建代购订单
   * @param createPurchaseOrderDto 代购订单信息
   * @param req 请求对象
   */
  @UseGuards(JwtAuthGuard)
  @Post('purchase-orders')
  async createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @Request() req,
  ) {
    return this.stationService.createPurchaseOrder(createPurchaseOrderDto, req.user.userId);
  }

  /**
   * 获取站长的代购订单列表
   * @param req 请求对象
   * @param status 状态筛选
   */
  @UseGuards(JwtAuthGuard)
  @Get('purchase-orders')
  async getPurchaseOrders(@Request() req, @Query('status') status?: number) {
    return this.stationService.getPurchaseOrders(req.user.userId, status);
  }

  /**
   * 获取代购订单详情
   * @param id 订单ID
   * @param req 请求对象
   */
  @UseGuards(JwtAuthGuard)
  @Get('purchase-orders/:id')
  async getPurchaseOrderDetail(@Param('id') id: number, @Request() req) {
    return this.stationService.getPurchaseOrderDetail(id, req.user.userId);
  }
}