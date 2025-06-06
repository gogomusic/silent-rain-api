import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { MailService } from 'src/common/mail/mail.service';
import { getRedisKey } from 'src/utils/redis';
import { RedisKeyPrefix } from 'src/common/enum/redis-key.enum';

@Injectable()
export class SysService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  /** 发送注册邮箱验证码 */
  async sendMailForRegister(email: string) {
    const { code } = await this.mailService.sendRegisterCode(email);
    const redisKey = getRedisKey(RedisKeyPrefix.REGISTER_CODE, email);
    await this.redisService.set(redisKey, code, 5 * 60); // 设置验证码有效期为5分钟
    return '发送成功';
  }
}
