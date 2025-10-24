import { Injectable, LoggerService } from '@nestjs/common';
import 'winston-daily-rotate-file';
import {
  Logger as WinstonLogger,
  createLogger,
  format,
  transports,
} from 'winston';
import chalk from 'chalk';
import dayjs from 'dayjs';

@Injectable()
export class Logger implements LoggerService {
  private logger: WinstonLogger;
  constructor() {
    const transportList: any[] = [
      new transports.DailyRotateFile({
        dirname: process.cwd() + '/logs',
        filename: 'application-%DATE%.info.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(({ context, level, message, timestamp }: any) => {
            return `[静夜聆雨] ${timestamp} ${level.toUpperCase()} ${context} ${message}`;
          }),
        ),
        level: 'info',
      }),
      new transports.DailyRotateFile({
        dirname: process.cwd() + '/logs',
        filename: 'application-%DATE%.error.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(({ context, level, message, timestamp }: any) => {
            return `[静夜聆雨] ${timestamp} ${level.toUpperCase()} ${context} ${message}`;
          }),
        ),
        level: 'error',
      }),
    ];
    if (process.env.NODE_ENV === 'development')
      transportList.unshift(
        // 打印到控制台
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ context, level, message, timestamp }: any) => {
              const appStr = chalk.green(`[静夜聆雨]`);
              const contextStr = chalk.yellow(`[${context}]`);
              return `${appStr} ${timestamp} ${level} ${contextStr} ${message}`;
            }),
          ),
        }),
      );

    this.logger = createLogger({
      level: 'debug',
      transports: transportList,
    });
  }
  log(message: string, context: string) {
    this.logger.log('info', message, {
      context,
      timestamp: this.#getTimestamp(),
    });
  }
  info(message: string, context: string) {
    this.logger.info(message, { context, timestamp: this.#getTimestamp() });
  }
  warn(message: string, context: string) {
    this.logger.warn(message, { context, timestamp: this.#getTimestamp() });
  }
  error(message: string, context: string) {
    this.logger.error(message, { context, timestamp: this.#getTimestamp() });
  }
  #getTimestamp() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  }
}
