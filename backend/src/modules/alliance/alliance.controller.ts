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
import { AllianceService } from './alliance.service';
import { CreateCouponTemplateDto } from './dto/alliance.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

/**
 * 百商联盟控制器
 */
@Controller('api/v1/alliance')
export class AllianceController {
  constructor(private readonly allianceService: AllianceService) {}

  /**
   * 商家签署联盟协议
   */
  @UseGuards(JwtAuthGuard)
  @Post('agreement')
  signAgreement(@Request() req, @Body('discountRate') discountRate: number) {
    return this.allianceService.signAgreement(req.user.userId, discountRate);
  }

  /**
   * 获取商家联盟协议
   */
  @UseGuards(JwtAuthGuard)
  @Get('agreement')
  getAgreement(@Request() req) {
    return this.allianceService.getAgreement(req.user.userId);
  }

  /**
   * 创建优惠券模板（商家）
   */
  @UseGuards(JwtAuthGuard)
  @Post('coupons')
  createCoupon(@Body() createCouponTemplateDto: CreateCouponTemplateDto) {
    return this.allianceService.createCouponTemplate(createCouponTemplateDto);
  }

  /**
   * 查询优惠券列表
   */
  @Get('coupons')
  findCoupons(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('merchantId') merchantId?: number,
    @Query('status') status?: number,
  ) {
    return this.allianceService.findCoupons({ skip, take, merchantId, status });
  }

  /**
   * 领取优惠券
   */
  @UseGuards(JwtAuthGuard)
  @Post('coupons/:id/receive')
  receiveCoupon(@Request() req, @Param('id') templateId: number) {
    return this.allianceService.receiveCoupon(req.user.userId, templateId);
  }

  /**
   * 获取用户优惠券列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-coupons')
  getMyCoupons(@Request() req, @Query('status') status?: number) {
    return this.allianceService.getUserCoupons(req.user.userId, status);
  }
}