import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getServerIps } from './common/utils/os';
import chalk from 'chalk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
