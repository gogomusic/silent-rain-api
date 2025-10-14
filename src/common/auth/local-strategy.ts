import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { ResponseDto } from '../http/dto/response.dto';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';

/** 本地身份验证策略 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true, // 允许访问 req
    });
  }

  async validate(
    req: Request,
    username: string,
    password: string,
  ): Promise<ResponseDto<User>> {
    const key_id = req.body.key_id as string;
    return await this.authService.validateUser(username, password, key_id);
  }
}
