import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CarpoolController } from './carpool.controller';
import { CarpoolService } from './carpool.service';
import { CarpoolProfile } from './entities/carpool-profile.entity';
import { CarpoolTrip } from './entities/carpool-trip.entity';
import { CarpoolBooking } from './entities/carpool-booking.entity';

/**
 * 顺风车模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CarpoolProfile, CarpoolTrip, CarpoolBooking]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    })
  ],
  controllers: [CarpoolController],
  providers: [CarpoolService],
  exports: [CarpoolService, TypeOrmModule],
})
export class CarpoolModule {}