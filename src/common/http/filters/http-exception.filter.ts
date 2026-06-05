import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BizCode } from 'src/common/constants/biz-code.enum';

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
    const bizCode = this.mapHttpStatusToBizCode(status);
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    response.status(status).json({
      code: bizCode,
      msg: message,
    });
  }

  private mapHttpStatusToBizCode(_status: HttpStatus): BizCode {
    return BizCode.FAIL;
  }
}
