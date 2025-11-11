import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerIps } from './common/utils/os';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from './common/logger/logger';
import { ValidationPipe } from '@nestjs/common';
import { ResponseDto } from './common/http/dto/response.dto';
import metadata from './metadata';

const PORT = process.env.PORT || 9161;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await SwaggerModule.loadPluginMetadata(metadata);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('「静夜聆雨」API文档')
    .setDescription('这是网站「静夜聆雨」的API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [ResponseDto],
    });
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'api-json',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useLogger(app.get(Logger));
  await app
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
