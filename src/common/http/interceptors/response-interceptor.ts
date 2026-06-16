import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';
import { Logger } from 'src/common/logger/logger';

/** 响应转换拦截器
 *
 * 统一将控制器返回结果包装为 ResponseDto 格式。
 * 如果控制器已经返回了 ResponseDto 实例，则不再重复包装。
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseDto<T>
> {
  @Inject(Logger)
  private readonly logger: Logger;

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        let result: ResponseDto<any>;
        if (data instanceof ResponseDto) {
          result = data;
        } else result = ResponseDto.success(data);

        const req = context.switchToHttp().getRequest();
        const logFormat = `
--------------------------------------------------------------------------------
Url:      ${req.originalUrl}
Method:   ${req.method}
IP:       ${req.ip}
Response: ${JSON.stringify(result)}
--------------------------------------------------------------------------------
        `;
        this.logger.log(logFormat, 'Response Interceptor');

        return result;
      }),
    );
  }
}
