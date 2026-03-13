import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

/**
 * 订单控制器
 */
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 创建订单
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * 获取用户订单列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyOrders(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: number,
  ) {
    return this.ordersService.findByUser(req.user.userId, { skip, take, status });
  }

  /**
   * 获取订单详情
   * @param id 订单ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }

  /**
   * 更新订单状态（商家/配送员）
   * @param id 订单ID
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  /**
   * 获取商家订单列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('merchant')
  getMerchantOrders(
    @Request() req,
    @Query('merchantId') merchantId: number,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.ordersService.findByMerchant(merchantId, { skip, take });
  }

  /**
   * 获取订单统计数据
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req, @Query('merchantId') merchantId: number) {
    return this.ordersService.countStats(merchantId);
  }
}