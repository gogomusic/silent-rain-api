import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../http/dto/response.dto';

/** 日期格式化拦截器
 * @description
 * NestJS拦截器，用于统一格式化响应中的日期字段（如`create_time`和`update_time`）。
 * 支持嵌套对象和数组结构，自动将日期格式化为`YYYY-MM-DD HH:mm:ss`字符串。
 *
 * @example
 * // 自动格式化返回数据中的日期字段
 * {
 *   create_time: new Date(),
 *   update_time: '2024-06-01T12:00:00Z'
 * }
 * =>
 * {
 *   create_time: '2024-06-01 12:00:00',
 *   update_time: '2024-06-01 12:00:00'
 * }
 */
@Injectable()
export class DateFormatInterceptor implements NestInterceptor {
  #dateFields = ['create_time', 'update_time'];

  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => this.formatDates(data)));
  }

  private formatDates(obj: any): any {
    if (obj instanceof ResponseDto) {
      return { ...obj, data: this.formatDates(obj.data) as unknown };
    } else if (Array.isArray(obj)) {
      return obj.map((item) => this.formatDates(item));
    } else if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const k in obj) {
        if (
          this.#dateFields.includes(k) &&
          obj[k] &&
          (obj[k] instanceof Date || typeof obj[k] === 'string')
        ) {
          newObj[k] = dayjs(obj[k]).format('YYYY-MM-DD HH:mm:ss');
        } else {
          newObj[k] = this.formatDates(obj[k]) as unknown;
        }
      }
      return newObj;
    }
    return obj;
  }
}
