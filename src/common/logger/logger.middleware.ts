import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from './logger';
import { NextFunction, Request, Response } from 'express';
import { normalizeIp } from '../utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    // 等响应结束再记录，确保拿到正确的 statusCode 与耗时
    res.on('finish', () => {
      const statusCode = res.statusCode;
      const duration = Date.now() - start;
      const xffHeader = req.headers['x-forwarded-for'];
      const xff = Array.isArray(xffHeader) ? xffHeader[0] : (xffHeader ?? '');
      const ip = normalizeIp(
        xff ? xff.split(',')[0].trim() : req.socket.remoteAddress || req.ip,
      );
      const userAgent = req.headers['user-agent'] || '';

      const logFormat = `
--------------------------------------------------------------------------------
Url:         ${req.originalUrl}
Method:      ${req.method}
IP:          ${ip}
StatusCode:  ${statusCode}
Duration:    ${duration}ms
Params:      ${JSON.stringify(req.params, null, 2)}
Query:       ${JSON.stringify(req.query, null, 2)}
Body:        ${JSON.stringify(req.body, null, 2)}
UserAgent:   ${userAgent}
--------------------------------------------------------------------------------
`;

      if (statusCode >= 500) {
        this.logger.error(logFormat, undefined, 'Request LoggerMiddleware');
      } else if (statusCode >= 400) {
        this.logger.warn(logFormat, 'Request LoggerMiddleware');
      } else {
        this.logger.log(logFormat, 'Request LoggerMiddleware');
      }
    });

    next();
  }
}
