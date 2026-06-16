import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MenuService } from 'src/menu/menu.service';
import { pathToRegexp } from 'path-to-regexp';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { ALLOW_NO_PERMISSION, IS_PUBLIC_KEY } from './token.decorator';
import { UserType } from 'src/common/enums/common.enum';

const forbidden = () => new ForbiddenException('无权访问');

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly menuService: MenuService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // 若函数请求头配置`@Public()`装饰器，允许访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 若函数请求头配置@AllowNoPermission()装饰器，允许访问
    const allowNoPermission = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_PERMISSION,
      [context.getHandler(), context.getClass()],
    );
    if (allowNoPermission) return true;

    // 无用户信息（无token），禁止访问
    const req: Request & { user: User } = context.switchToHttp().getRequest();
    if (!req.user) throw forbidden();

    // 超级管理员，允许访问
    if (req.user.type === UserType.ADMIN_USER) return true;

    // 获取该用户所拥有的所有接口权限
    const userApis = await this.menuService.findUserApis(req.user.id);
    const index = userApis.findIndex((perm) => {
      const [controller, action] = perm.split(':'); // 示例：user:list，表示“资源:操作”
      const reqUrl = req.url.split('?')[0];
      return !!pathToRegexp(`/api/${controller}/${action}`).regexp.exec(reqUrl);
    });
    if (index === -1) throw forbidden();
    return true;
  }
}
