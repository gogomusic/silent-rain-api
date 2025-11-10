import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { catchError, Observable, tap, timeout, TimeoutError } from 'rxjs';
import { OperationLog } from 'src/log/entities/operation-log.entity';
import { LogService } from 'src/log/log.service';
import { User } from 'src/user/entities/user.entity';
import { UAParser } from 'ua-parser-js';
import { DeviceType, OperationResultEnum } from '../enum/common.enum';
import { normalizeIp } from 'src/common/utils';
import { ResponseDto } from '../http/dto/response.dto';
import { Reflector } from '@nestjs/core';
import {
  OPERATION_ACTION,
  OPERATION_MODULE,
} from '../decorators/operation.decorator';
import { LoginLog } from 'src/log/entities/login-log.entity';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logService: LogService,
    private readonly reflector: Reflector,
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
    const { user, method, url, body, headers, files } = request;
    const xff = (headers['x-forwarded-for'] as string) || '';
    const ip = normalizeIp(
      xff
        ? xff.split(',')[0].trim()
        : request.socket.remoteAddress || request.ip,
    );
    const userAgent = headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const browser =
      `${parser.getBrowser().name || ''} ${parser.getBrowser().version || ''}`.trim();
    const os =
      `${parser.getOS().name || ''} ${parser.getOS().version || ''}`.trim();
    const deviceObj = parser.getDevice();
    const deviceType = DeviceType[deviceObj.type || 'desktop'];
    const deviceModel = deviceObj.model || '';
    const deviceVendor = deviceObj.vendor || '';
    const device = deviceType
      ? `${deviceType} ${deviceVendor} ${deviceModel}`.trim()
      : DeviceType.desktop;
    const params = JSON.stringify({
      ...body,
      password: body?.password ? '******' : undefined, // 移除密码
      new_password: body?.new_password ? '******' : undefined, // 移除新密码
      confirm: body?.confirm ? '******' : undefined, // 移除确认密码
      files: Array.isArray(files) && files.length > 0 ? files : undefined,
    });
    let logEntry: OperationLog | undefined = undefined;
    const isRecordLog = Boolean(module && action);
    if (isRecordLog) {
      const log = plainToInstance(
        OperationLog,
        {
          user_id: user?.id,
          username: user?.username,
          nickname: user?.nickname,
          module,
          action,
          status: OperationResultEnum.FAIL,
          ip,
          device,
          browser,
          os,
          user_agent: userAgent,
          method,
          url,
          params,
        },
        { ignoreDecorators: true },
      );
      logEntry = await this.logService.createOperationLog(log);
    }

    return next.handle().pipe(
      timeout(30000),
      tap((data: ResponseDto) => {
        const { success, msg } = data;
        const status = success
          ? OperationResultEnum.SUCCESS
          : OperationResultEnum.FAIL;
        // 记录登录日志
        if (['/user/login', '/user/logout'].includes(request.originalUrl)) {
          let user_id: number | undefined = undefined,
            username: string | undefined = undefined,
            nickname: string | undefined = undefined;
          if (request.originalUrl === '/user/login') {
            user_id = (user as unknown as ResponseDto<User>).data?.id;
            username = (user as unknown as ResponseDto<User>).data?.username;
            nickname = (user as unknown as ResponseDto<User>).data?.nickname;
          } else {
            user_id = user.id;
            username = user.username;
            nickname = user.nickname;
          }

          if (success) {
            const log = plainToInstance(
              LoginLog,
              {
                user_id,
                username,
                nickname,
                type: request.originalUrl === '/user/login' ? 1 : 0,
                ip,
                status: OperationResultEnum.SUCCESS,
                device,
                browser,
                os,
                user_agent: userAgent,
              },
              { ignoreDecorators: true },
            );
            this.logService.createLoginLog(log).catch((err) => {
              throw err;
            });
          }
        } else {
          if (isRecordLog && logEntry?.id) {
            const fail_result = success
              ? ''
              : Array.isArray(msg)
                ? msg.join('\n')
                : msg || '';
            this.logService
              .updateOperationLog(logEntry.id, {
                status,
                fail_result,
                duration: Date.now() - start,
              })
              .catch((err) => {
                throw err;
              });
          }
        }
      }),
      catchError(async (error) => {
        const errorMessage = error.response?.message || error.message;
        if (isRecordLog && logEntry?.id) {
          await this.logService.updateOperationLog(logEntry.id, {
            status: OperationResultEnum.FAIL,
            fail_result: errorMessage,
            duration: Date.now() - start,
          });
        }
        let result: ResponseDto | undefined = undefined;
        if (error instanceof TimeoutError) {
          result = ResponseDto.error('请求超时');
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          result = ResponseDto.error(errorMessage);
        }
        delete result._isResponseDto;
        return result;
      }),
    );
  }

  /** 获取操作元数据 */
  private getOperationMetaData(context: ExecutionContext) {
    const logModule = this.reflector.get<string>(
      OPERATION_MODULE,
      context.getClass(),
    );
    const logAction = this.reflector.get<string>(
      OPERATION_ACTION,
      context.getHandler(),
    );
    return {
      module: logModule || '',
      action: logAction || '',
    };
  }
}
