import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_NO_TOKEN } from '../decorators/token.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 若函数请求头配置@AllowNoToken()装饰器，允许访问
    const allowNoToken = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_TOKEN,
      [context.getHandler(), context.getClass()],
    );
    if (allowNoToken) return true;
    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('登录状态已过期，请重新登录');
    }
    return user;
  }
}
