import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MenuService } from 'src/menu/menu.service';
import { ALLOW_NO_PERMISSION } from '../decorators/permission.decorator';
import { Request } from 'express';
import { pathToRegexp } from 'path-to-regexp';
import { User } from 'src/user/entities/user.entity';
import { ALLOW_NO_TOKEN } from '../decorators/token.decorator';
import { UserType } from '../enum/common.enum';

const forbidden = () => new ForbiddenException('无权访问');

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly menuService: MenuService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // 若函数请求头配置@AllowNoToken()装饰器，允许访问
    const allowNoToken = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_TOKEN,
      [context.getHandler(), context.getClass()],
    );
    if (allowNoToken) return true;

    // 若函数请求头配置@AllowNoPermission()装饰器，允许访问
    const allowNoPermission = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_PERMISSION,
      [context.getHandler(), context.getClass()],
    );
    if (allowNoPermission) return true;

    // 无用户信息（无token），禁止访问
    const req: Request & { user: User } = context.switchToHttp().getRequest();
    if (!req.user) throw forbidden();
    if (req.user.user_type === UserType.ADMIN_USER) return true;

    // 获取该用户所拥有的所有接口权限
    const userApis = await this.menuService.findUserApis(req.user.id);
    const index = userApis.findIndex((perm) => {
      const [_prefix, controller, action] = perm.split(':'); // 示例：sys:user:list
      const reqUrl = req.url.split('?')[0];
      return !!pathToRegexp(`/${controller}/${action}`).regexp.exec(reqUrl);
    });
    if (index === -1) throw forbidden();
    return true;
  }
}
