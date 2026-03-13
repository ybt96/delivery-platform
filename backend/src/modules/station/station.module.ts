import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { StationController } from './station.controller';
import { StationService } from './station.service';
import { Station } from './entities/station.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { StationDelivery } from './entities/station-delivery.entity';

/**
 * 服务站模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Station, PurchaseOrder, StationDelivery]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    })
  ],
  controllers: [StationController],
  providers: [StationService],
  exports: [StationService, TypeOrmModule],
})
export class StationModule {}