import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err) {
      throw err;
    }

    if (user) {
      return user;
    }

    let msg: string = typeof info === 'string' ? info : info?.message;
    if (!msg || msg === 'Missing credentials') msg = '用户名或密码错误';

    throw new BadRequestException(msg);
  }
}
