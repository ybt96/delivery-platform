import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppModule } from './app.module';
import { AppConfigModule } from './config/app-config.module';
import { CommonConfigModule } from './common/common-config.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';

/**
 * 核心模块
 * 导入所有必需的基础模块
 */
@Module({
  imports: [
    // 配置模块
    AppConfigModule,
    CommonConfigModule,

    // 数据库模块
    DatabaseModule,

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret') || 'default-secret',
        signOptions: { expiresIn: configService.get('jwt.expiresIn') || '7d' },
      }),
      inject: [ConfigService],
    }),

    // 缓存模块 (Redis) - 暂时注释掉，避免Redis连接错误
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     store: await redisStore({
    //       socket: {
    //         host: configService.get('redis.host') || 'localhost',
    //         port: configService.get('redis.port') || 6379,
    //       },
    //       password: configService.get('redis.password') || '',
    //     }),
    //   }),
    //   inject: [ConfigService],
    // }),

    // 公共模块
    CommonModule,
  ],
  exports: [
    AppConfigModule,
    CommonConfigModule,
    DatabaseModule,
    JwtModule,
    // CacheModule,
    CommonModule,
  ],
})
export class CoreModule {}