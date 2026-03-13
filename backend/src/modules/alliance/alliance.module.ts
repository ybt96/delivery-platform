import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AllianceController } from './alliance.controller';
import { AllianceService } from './alliance.service';
import { AllianceAgreement } from './entities/alliance-agreement.entity';
import { CouponTemplate } from './entities/coupon-template.entity';
import { UserCoupon } from './entities/user-coupon.entity';

/**
 * 百商联盟模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AllianceAgreement, CouponTemplate, UserCoupon]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    })
  ],
  controllers: [AllianceController],
  providers: [AllianceService],
  exports: [AllianceService, TypeOrmModule],
})
export class AllianceModule {}