import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './dto/response.dto';

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
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ResponseDto) {
          return data;
        }
        return ResponseDto.success(data);
      }),
    );
  }
}
