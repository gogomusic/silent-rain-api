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
 * 统一处理返回结果
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
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
