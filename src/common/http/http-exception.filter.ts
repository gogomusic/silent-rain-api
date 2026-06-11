import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResponseDto } from './dto/response.dto';
import { ErrorShowType } from './dto/response.enum';
import { Logger } from '../logger/logger';
import { getRequestIp } from '../utils';

/** 异常过滤器
 *
 * 处理所有异常，转换为统一的错误响应格式
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  @Inject(Logger)
  private readonly logger: Logger;
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse();
    const message: string =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message ||
          exception.message ||
          '服务器内部错误';
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const ResponseString =
      exception.toString() +
      ' ' +
      (exception.toString().endsWith(message) ? '' : message);
    const ip = getRequestIp(request);
    const logFormat = `
--------------------------------------------------------------------------------
Url:        ${request.originalUrl}
Method:     ${request.method}
IP:         ${ip}
StatusCode: ${status}
Response:   ${ResponseString}
--------------------------------------------------------------------------------
        `;
    this.logger.error(logFormat, undefined, 'HttpException filter');

    response
      .status(status)
      .json(ResponseDto.fail(status, message, ErrorShowType.ERROR_MESSAGE));
  }
}
