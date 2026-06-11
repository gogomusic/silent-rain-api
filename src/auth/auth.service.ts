import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { RedisService } from 'src/common/redis/redis.service';
import { getRedisKey } from 'src/common/utils/redis';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly UserService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(username: string, password: string) {
    // 支持用户名或邮箱登录
    const isEmail = username.includes('@');
    const user = isEmail
      ? await this.UserService.findOneByEmailWithPwd(username)
      : await this.UserService.findOneByUsernameWithPwd(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      delete (user as any).password;
      return user;
    }
    return null;
  }

  /** 生成Token */
  generateAccessToken(id: number, username: string) {
    const payload = { username, sub: id };
    return this.jwtService.sign(payload);
  }

  /** 退出登录 */
  async logout(token: string) {
    // 解析 token 获取过期时间
    const decoded = this.jwtService.decode(token);
    if (!decoded || !decoded.exp) return;

    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now; // 剩余有效秒数
    if (ttl > 0) {
      const redisKey = getRedisKey(RedisKeyPrefix.TOKEN_BLACKLIST, token);
      await this.redisService.set(redisKey, '1', ttl);
    }
  }
}
