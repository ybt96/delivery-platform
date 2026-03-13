import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 应用配置服务
 */
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get appEnv(): string {
    return this.configService.get<string>('app.env') || 'development';
  }

  get appPort(): number {
    return this.configService.get<number>('app.port') || 3000;
  }

  get isDebug(): boolean {
    return this.configService.get<boolean>('app.debug') || false;
  }

  get databaseType(): string {
    return this.configService.get<string>('database.type') || 'mysql';
  }

  get databaseHost(): string {
    return this.configService.get<string>('database.host') || 'localhost';
  }

  get databasePort(): number {
    return this.configService.get<number>('database.port') || 3306;
  }

  get databaseUsername(): string {
    return this.configService.get<string>('database.username') || 'root';
  }

  get databasePassword(): string {
    return this.configService.get<string>('database.password') || '';
  }

  get databaseName(): string {
    return this.configService.get<string>('database.database') || 'xianglixtangqin';
  }

  get databaseAutoSync(): boolean {
    return this.configService.get<boolean>('database.autoSync') || false;
  }

  get jwtSecret(): string {
    return this.configService.get<string>('jwt.secret') || 'your-secret-key';
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('jwt.expiresIn') || '15m';
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>('jwt.refreshSecret') || 'your-refresh-secret';
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
  }

  get redisHost(): string {
    return this.configService.get<string>('redis.host') || 'localhost';
  }

  get redisPort(): number {
    return this.configService.get<number>('redis.port') || 6379;
  }

  get redisPassword(): string {
    return this.configService.get<string>('redis.password') || '';
  }

  get uploadMaxSize(): number {
    return this.configService.get<number>('upload.maxSize') || 2 * 1024 * 1024;
  }

  get uploadAllowedTypes(): string[] {
    return this.configService.get<string[]>('upload.allowedTypes') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
  }

  get uploadPath(): string {
    return this.configService.get<string>('upload.uploadPath') || './uploads';
  }

  get carpoolMaxDistance(): number {
    return this.configService.get<number>('carpool.maxDistance') || 20;
  }

  get carpoolMaxPricePerPerson(): number {
    return this.configService.get<number>('carpool.maxPricePerPerson') || 50;
  }
}
