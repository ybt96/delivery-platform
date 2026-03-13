import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { Merchant } from './entities/merchant.entity';

/**
 * 商家模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    })
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService, TypeOrmModule],
})
export class MerchantsModule {}