import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { DeliveryTask } from './entities/delivery-task.entity';
import { Deliverer } from './entities/deliverer.entity';
import { DeliveryTrack } from './entities/delivery-track.entity';

/**
 * 配送模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryTask, Deliverer, DeliveryTrack]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    })
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService, TypeOrmModule],
})
export class DeliveriesModule {}