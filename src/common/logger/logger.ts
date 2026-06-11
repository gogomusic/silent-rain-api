import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Logger as WinstonLogger,
  createLogger,
  format,
  transports,
} from 'winston';
import 'winston-daily-rotate-file';
import chalk from 'chalk';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

/** 文件日志格式化模板 */
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ context, level, message, stack, timestamp }: any) => {
    const ctx = context ?? 'Application';
    const header = `[静夜聆雨] ${timestamp} [${ctx}] ${level.toUpperCase()}`;
    const body =
      typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    return stack ? `${header} ${body}\n${stack}` : `${header} ${body}`;
  }),
);

/** 控制台日志格式化模板（开发环境） */
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ context, level, message, stack, timestamp }: any) => {
    const appStr = chalk.green(`[静夜聆雨]`);
    const ctx = context ?? 'Application';
    const contextStr = chalk.yellow(`[${ctx}]`);
    const text =
      typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    const levelText =
      level === 'error'
        ? chalk.red(level.toUpperCase())
        : level === 'warn'
          ? chalk.yellow(level.toUpperCase())
          : level === 'debug'
            ? chalk.cyan(level.toUpperCase())
            : level === 'verbose'
              ? chalk.magenta(level.toUpperCase())
              : chalk.blue(level.toUpperCase());
    const base = `${appStr} ${timestamp} ${levelText} ${contextStr} ${text}`;
    return stack ? `${base}\n${chalk.gray(stack)}` : base;
  }),
);

@Injectable()
export class Logger implements LoggerService {
  private logger: WinstonLogger;

  constructor(private readonly configService: ConfigService) {
    const transportList: (
      | transports.ConsoleTransportInstance
      | DailyRotateFile
    )[] = [
      new transports.DailyRotateFile({
        dirname: path.join(process.cwd(), 'logs'),
        filename: 'application-%DATE%.info.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
        level: 'info',
      }),
      new transports.DailyRotateFile({
        dirname: path.join(process.cwd(), 'logs'),
        filename: 'application-%DATE%.error.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
        level: 'error',
      }),
    ];
    const isDev = configService.get('NODE_ENV') === 'development';
    if (isDev) {
      transportList.unshift(new transports.Console({ format: consoleFormat }));
    }
    this.logger = createLogger({
      level: 'debug',
      transports: transportList,
    });
  }

  log(message: string, context?: string) {
    this.logger.log('info', message, { context });
  }
  warn(message: string, context: string) {
    this.logger.warn(message, { context });
  }
  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, { stack, context });
  }
  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
  verbose(message: string, context?: string) {
    this.logger.log('verbose', message, { context });
  }
  fatal(message: string, context?: string) {
    this.logger.error(message, { context });
  }
}
