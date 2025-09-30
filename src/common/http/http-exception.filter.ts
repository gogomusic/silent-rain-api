import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from './dto/response.dto';

/** 异常过滤器
 *
 * 处理所有异常，转换为统一的错误响应格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log(exception);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        message = Array.isArray(response.message)
          ? response.message.join(', ')
          : (response.message as string);
      }
    }
    response.status(status).json(ResponseDto.error(message, status));
  }
}
