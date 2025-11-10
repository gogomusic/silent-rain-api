import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResponseDto } from './dto/response.dto';
import { Logger } from '../logger/logger';

/** 异常过滤器
 *
 * 处理所有异常，转换为统一的错误响应格式
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  @Inject(Logger)
  private readonly logger: Logger;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse();
    const message: string =
      exceptionResponse?.message || exception.message || '服务器内部错误';
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const ResponseString =
      exception.toString() +
      ' ' +
      ((exception.toString() as string).endsWith(message) ? '' : message);
    const logFormat = `
################################################################################
Url: ${request.originalUrl}
Method: ${request.method}
IP: ${request.ip}
StatusCode: ${status}
Response: ${ResponseString}
################################################################################
        `;
    this.logger.error(logFormat, 'HttpException filter');
    const result = ResponseDto.error(message, status);
    delete result._isResponseDto;
    response.status(status).json(result);
  }
}
