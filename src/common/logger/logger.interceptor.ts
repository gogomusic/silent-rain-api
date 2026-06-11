import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { catchError, Observable, tap, timeout, TimeoutError } from 'rxjs';
import { LogService } from 'src/log/log.service';
import { User } from 'src/user/entities/user.entity';
import { UAParser } from 'ua-parser-js';
import { getRequestIp } from 'src/common/utils';
import { ResponseDto } from '../http/dto/response.dto';
import { Reflector } from '@nestjs/core';
import { Log } from 'src/log/entities/log.entity';
import { DeviceType } from '../enums/common.enum';
import { OPERATION_ACTION, OPERATION_MODULE } from './operation.decorator';
import { Logger } from './logger';

const REQUEST_TIMEOUT = 30000;
/** 敏感字段，不应记录到日志 */
const SENSITIVE_FIELDS = [
  'password',
  'newPassword',
  'oldPassword',
  'confirmPassword',
];

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logService: LogService,
    private readonly reflector: Reflector,
    private readonly logger: Logger,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const start = Date.now();
    const { module, action } = this.getOperationMetaData(context);
    const request: Request & { user: User } = context
      .switchToHttp()
      .getRequest();
    const { user, method, url, body, headers } = request;
    const files = (request as any).files;
    const logData = {
      userId: user?.id,
      username: user?.username,
      nickname: user?.nickname,
      module,
      action,
      ip: getRequestIp(request),
      ...this.parseUserAgent(headers['user-agent'] || ''),
      method,
      url,
      params: this.maskSensitiveFields(body, files),
    };

    let logEntry: Log | undefined;
    /** 是否记录日志 */
    const isRecordLog = Boolean(module && action);

    if (isRecordLog) {
      const log = plainToInstance(
        Log,
        { ...logData, status: false },
        { ignoreDecorators: true },
      );
      logEntry = await this.logService.createLog(log);
    }

    return next.handle().pipe(
      timeout(REQUEST_TIMEOUT),
      tap((data: ResponseDto) => {
        if (isRecordLog && logEntry) {
          this.updateLog(logEntry.id, data.success, data.errorMessage, start);
        }
      }),
      catchError(async (error) => {
        if (isRecordLog && logEntry) {
          const errorMessage = error.response?.message || error.message;
          const message = Array.isArray(errorMessage)
            ? errorMessage.join('\n')
            : errorMessage || '';
          await this.logService.updateLog(logEntry.id, {
            status: false,
            errorMessage: message,
            duration: Date.now() - start,
          });
        }

        if (error instanceof TimeoutError) {
          return ResponseDto.fail(HttpStatus.GATEWAY_TIMEOUT, '操作超时');
        }

        const errorMessage: string = error.response?.message || error.message;
        return ResponseDto.fail(HttpStatus.BAD_REQUEST, errorMessage);
      }),
    );
  }

  /** 解析用户代理信息 */
  private parseUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    return {
      device: this.formatDevice(device),
      browser: this.formatString(browser.name, browser.version),
      os: this.formatString(os.name, os.version),
      userAgent,
    };
  }

  /** 格式化字符串（名称 + 版本） */
  private formatString(name?: string, version?: string): string {
    return `${name || ''} ${version || ''}`.trim();
  }

  /** 格式化设备信息 */
  private formatDevice(deviceObj: any): string {
    const deviceType =
      DeviceType[
        String(deviceObj.type || 'desktop') as keyof typeof DeviceType
      ];
    if (!deviceType) return DeviceType.desktop;
    const parts = [deviceType, deviceObj.vendor, deviceObj.model].filter(
      Boolean,
    );
    return parts.join(' ').trim() || DeviceType.desktop;
  }

  /** 移除敏感字段 */
  private maskSensitiveFields(body: any, files: any): string {
    const masked = { ...body };
    SENSITIVE_FIELDS.forEach((field) => {
      if (field in masked && masked[field]) {
        masked[field] = '******';
      }
    });
    masked.files = Array.isArray(files) && files.length > 0 ? files : undefined;
    return JSON.stringify(masked);
  }

  /** 更新日志 */
  private updateLog(
    logId: number,
    success: boolean,
    errorMessage: ResponseDto['errorMessage'],
    startTime: number,
  ): void {
    const message = success
      ? undefined
      : Array.isArray(errorMessage)
        ? errorMessage.join('\n')
        : errorMessage || '';
    this.logService
      .updateLog(logId, {
        status: success,
        errorMessage: message,
        duration: Date.now() - startTime,
      })
      .catch((err: unknown) => {
        // 日志更新失败不应该中断主流程
        const errorStack = err instanceof Error ? err.stack : String(err);
        try {
          this.logger.error(
            message ?? '操作日志更新失败',
            errorStack,
            'Logger Interceptor',
          );
        } catch (e) {
          console.error('Failed to update log:', e);
        }
      });
  }

  /** 获取操作元数据 */
  private getOperationMetaData(context: ExecutionContext) {
    const module = this.reflector.get<string>(
      OPERATION_MODULE,
      context.getClass(),
    );
    const action = this.reflector.get<string>(
      OPERATION_ACTION,
      context.getHandler(),
    );
    return { module: module || '', action: action || '' };
  }
}
