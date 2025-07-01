import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerIps } from './utils/os';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('「静夜聆雨」API文档')
    .setDescription('这是网站「静夜聆雨」的API文档')
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('\n服务启动成功');
    console.log(`IP: ${getServerIps().join(', ')}`);
    console.log(`端口: ${process.env.PORT ?? 3000}\n`);
  })
  .catch((error) => console.log(error));
