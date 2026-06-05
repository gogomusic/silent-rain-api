import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getServerIps } from './common/utils/os';
import chalk from 'chalk';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseDto } from './common/http/dto/response.dto';
import { ResponseInterceptor } from './common/http/response-interceptor';
import { HttpExceptionFilter } from './common/http/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('静夜聆雨 API文档')
    .setDescription('网站「静夜聆雨」的API文档')
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

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  const PORT = Number(configService.get<string>('PORT'));
  const NODE_ENV = configService.get<string>('NODE_ENV')!;

  await app.listen(PORT);

  return { PORT, NODE_ENV };
}

function printBanner(PORT: number, NODE_ENV: string) {
  const ips = getServerIps();
  const dim = chalk.hex('#888');
  const divider = dim(` ──${'─'.repeat(40)}`);

  console.log(`\n${chalk.cyan.bold(' ◈ 环境信息')}${divider}`);
  console.log(`   ${chalk.dim('环境')}      ${chalk.white(NODE_ENV)}`);

  console.log(`\n${chalk.green.bold(' ◈ 服务启动')}${divider}`);
  console.log(`   ${chalk.green('🚀  Silent Rain API 已启动')}`);
  console.log(`   ${chalk.dim('IP')}       ${chalk.yellow(ips.join(', '))}`);
  console.log(`   ${chalk.dim('端口')}     ${chalk.yellow(PORT)}\n`);
}

bootstrap()
  .then(({ PORT, NODE_ENV }) => {
    printBanner(PORT, NODE_ENV);
  })
  .catch((error) => console.error(error));
