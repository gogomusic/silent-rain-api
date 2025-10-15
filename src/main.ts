import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerIps } from './utils/os';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/http/transform-interceptor';
import { HttpExceptionFilter } from './common/http/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const PORT = process.env.PORT || 9161;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('「静夜聆雨」API文档')
    .setDescription('这是网站「静夜聆雨」的API文档')
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'api-json',
  });
  await app
    .useGlobalFilters(new HttpExceptionFilter())
    .useGlobalInterceptors(new TransformInterceptor())
    .useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    })
    .listen(PORT);
}

bootstrap()
  .then(() => {
    console.info('\n服务启动成功');
    console.info(`IP: ${getServerIps().join(', ')}`);
    console.info(`端口: ${PORT}\n`);
  })
  .catch((error) => console.error(error));
