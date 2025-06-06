import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServerIps } from './utils/os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('\n服务启动成功');
    console.log(`IP: ${getServerIps().join(', ')}`);
    console.log(`端口: ${process.env.PORT ?? 3000}\n`);
  })
  .catch((error) => console.log(error));
