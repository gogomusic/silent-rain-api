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
        const logFormat = `
################################################################################
Url: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
Response: ${JSON.stringify(data)}
################################################################################
        `;
        this.logger.info(logFormat, 'Response Interceptor');
        // 如果控制器已经返回了ResponseDto格式，则不再包装
        if (data instanceof ResponseDto) {
          return data;
        }
        // 包装普通返回结果
        return ResponseDto.success(data);
      }),
    );
  }
}
