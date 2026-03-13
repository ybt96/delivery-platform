import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS 配置
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Swagger API 文档配置
  const config = new DocumentBuilder()
    .setTitle('地方特色局域网络物资配送平台 API')
    .setDescription('地方配送平台后端 API 文档，包含用户体系、商品、订单、配送、百商联盟、顺风车等模块')
    .setVersion('1.0')
    .addTag('auth', '认证模块')
    .addTag('users', '用户模块')
    .addTag('products', '商品模块')
    .addTag('orders', '订单模块')
    .addTag('deliveries', '配送模块')
    .addTag('alliance', '百商联盟模块')
    .addTag('carpool', '顺风车模块')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 应用启动成功`);
  console.log(`📝 API 文档: http://localhost:${port}/api-docs`);
  console.log(`🔗 服务地址: http://localhost:${port}`);
}
bootstrap();
