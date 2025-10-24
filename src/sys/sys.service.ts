import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { MailService } from 'src/common/mail/mail.service';
import { getRedisKey } from 'src/utils/redis';
import { RedisKeyPrefix } from 'src/common/enum/redis-key.enum';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import NodeRSA from 'node-rsa';

@Injectable()
export class SysService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    @Inject('RSA_STORE')
    private readonly rsa_store: {
      key: NodeRSA | undefined;
      public_key: string | undefined;
    },
  ) {}

  /** 发送注册邮箱验证码 */
  async sendMailForRegister(email: string) {
    const { code } = await this.mailService.sendRegisterCode(email);
    const redisKey = getRedisKey(RedisKeyPrefix.REGISTER_CODE, email);
    await this.redisService.set(redisKey, code, 5 * 60); // 设置验证码有效期为5分钟
    return ResponseDto.success();
  }

  /**
   * 生成一对 RSA 密钥，并返回公钥
   */
  getPublicKey() {
    return ResponseDto.success(this.rsa_store.public_key);
  }

  /** 解密 */
  decrypt(encryptedData: string) {
    const data = this.rsa_store.key?.decrypt(encryptedData, 'utf8');
    return data;
  }
}
