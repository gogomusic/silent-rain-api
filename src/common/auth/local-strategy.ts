import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { ResponseDto } from '../http/dto/response.dto';
import { User } from 'src/user/entities/user.entity';

/** 本地身份验证策略 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<ResponseDto<User>> {
    return await this.authService.validateUser(username, password);
  }
}
