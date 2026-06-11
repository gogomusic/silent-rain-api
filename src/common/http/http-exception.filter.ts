import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from './dto/response.dto';
import { ErrorShowType } from './dto/response.enum';

/** 异常过滤器
 *
 * 处理所有异常，转换为统一的错误响应格式
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message: string =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    response
      .status(status)
      .json(ResponseDto.fail(status, message, ErrorShowType.ERROR_MESSAGE));
  }
}
