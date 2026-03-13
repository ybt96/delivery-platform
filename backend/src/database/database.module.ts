import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * 数据库模块
 * 配置 TypeORM 连接，统一从配置中心（.env + ConfigModule）读取，禁止硬编码。
 * 库名统一来源：DB_NAME（.env）-> configuration.ts database.database
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 3306),
        username: configService.get<string>('database.username', 'root'),
        password: configService.get<string>('database.password', ''),
        database: configService.get<string>('database.database', 'xianglixtangqin'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.autoSync', false),
        logging: configService.get<boolean>('database.logging', false),
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}