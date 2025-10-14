import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entities/user.entity';

/** JWT身份验证策略 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // JWT 会从 HTTP 请求头的 Authorization 字段中提取 token，格式为 Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 确保 JWT 过期时不会被忽略。如果 token 已过期，认证会失败并返回 401 未授权错误
      ignoreExpiration: false,
      // 用于验证 JWT 签名的密钥
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  validate(payload: User) {
    return payload;
  }
}
