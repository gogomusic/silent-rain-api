import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from './logger';
import { NextFunction, Request, Response } from 'express';
import { normalizeIp } from 'src/utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      // 等响应结束再记录，确保拿到正确的 statusCode 与耗时
      const statusCode = res.statusCode;
      const duration = Date.now() - start;
      const xff = (req.headers['x-forwarded-for'] as string) || '';
      const ip = normalizeIp(
        xff ? xff.split(',')[0].trim() : req.socket.remoteAddress || req.ip,
      );
      const userAgent = req.headers['user-agent'] || '';

      const logFormat = `
################################################################################
Url: ${req.originalUrl}
Method: ${req.method}
IP: ${ip}
StatusCode: ${statusCode}
Duration: ${duration}ms
Params: ${JSON.stringify(req.params)}
Query: ${JSON.stringify(req.query)}
Body: ${JSON.stringify(req.body)}
UserAgent: ${userAgent}
################################################################################
    `;

      if (statusCode >= 500) {
        this.logger.error(logFormat, 'Request LoggerMiddleware');
      } else if (statusCode >= 400) {
        this.logger.warn(logFormat, 'Request LoggerMiddleware');
      } else {
        this.logger.log(logFormat, 'Request LoggerMiddleware');
      }
    });
    next();
  }
}
