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
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryTaskDto, UpdateDeliveryTaskDto } from './dto/delivery.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

/**
 * 配送控制器
 */
@Controller('api/v1/deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  /**
   * 创建配送任务（系统自动创建）
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDeliveryTaskDto: CreateDeliveryTaskDto) {
    return this.deliveriesService.create(createDeliveryTaskDto);
  }

  /**
   * 获取配送员任务列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyTasks(
    @Request() req,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: number,
  ) {
    // TODO: 获取当前配送员ID
    const delivererId = req.user.userId;
    return this.deliveriesService.findByDeliverer(delivererId, { skip, take, status });
  }

  /**
   * 获取配送任务详情
   * @param id 任务ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.deliveriesService.findOne(id);
  }

  /**
   * 更新配送任务状态
   * @param id 任务ID
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateDeliveryTaskDto: UpdateDeliveryTaskDto,
  ) {
    return this.deliveriesService.update(id, updateDeliveryTaskDto);
  }

  /**
   * 上传位置信息
   * @param id 任务ID
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/location')
  uploadLocation(
    @Param('id') id: number,
    @Body() locationData: { latitude: number; longitude: number },
  ) {
    return this.deliveriesService.addTrackPoint(id, locationData);
  }

  /**
   * 获取配送轨迹
   * @param id 任务ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/tracks')
  getTracks(@Param('id') id: number) {
    return this.deliveriesService.getTracks(id);
  }
}