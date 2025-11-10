import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './dto/response.dto';
import { Logger } from '../logger/logger';
import { plainToInstance } from 'class-transformer';

/** 响应转换拦截器
 *
 * 统一处理返回结果
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  @Inject(Logger)
  private readonly logger: Logger;
  constructor() {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    const req = context.getArgByIndex(1).req;
    return next.handle().pipe(
      map((data) => {
        let result: ResponseDto;
        if (data instanceof ResponseDto) {
          // 如果控制器已经返回了ResponseDto格式，则不再包装
          result = data;
        } else if (data?._isResponseDto) {
          result = plainToInstance(ResponseDto, data);
        } else {
          // 包装普通返回结果
          result = ResponseDto.success(data);
        }
        delete result._isResponseDto;
        const logFormat = `
################################################################################
Url: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
Response: ${JSON.stringify(result)}
################################################################################
        `;
        this.logger.info(logFormat, 'Response Interceptor');
        return result;
      }),
    );
  }
}
