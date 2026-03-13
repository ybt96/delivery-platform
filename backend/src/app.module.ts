import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { AllianceModule } from './modules/alliance/alliance.module';
import { CarpoolModule } from './modules/carpool/carpool.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { StationModule } from './modules/station/station.module';

@Module({
  imports: [
    // 核心模块
    CoreModule,

    // 业务模块
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    DeliveriesModule,
    AllianceModule,
    CarpoolModule,
    MerchantsModule,
    StationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
