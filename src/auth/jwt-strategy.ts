import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { REDIS_CLIENT } from 'src/common/redis/redis.module';
import { getRedisKey } from 'src/common/utils/redis';
import { UserService } from 'src/user/user.service';
import Redis from 'ioredis';
import { Request } from 'express';

/** JWT身份验证策略 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly UserService: UserService,
    readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    super({
      // JWT 会从 HTTP 请求头的 Authorization 字段中提取 token，格式为 Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 确保 JWT 过期时不会被忽略。如果 token 已过期，认证会失败并返回 401 未授权错误
      ignoreExpiration: false,
      // 用于验证 JWT 签名的密钥
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      // 将 request 传递给 validate 方法
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: { sub: number; username: string }) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (token) {
      const blacklistKey = getRedisKey(RedisKeyPrefix.TOKEN_BLACKLIST, token);
      const isBlacklisted = await this.redis.get(blacklistKey);
      if (isBlacklisted) {
        throw new UnauthorizedException();
      }
    }
    return this.UserService.findOneById(payload.sub);
  }
}
