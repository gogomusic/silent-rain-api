import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { MailService } from 'src/common/mail/mail.service';
import { getRedisKey } from 'src/utils/redis';
import { RedisKeyPrefix } from 'src/common/enum/redis-key.enum';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import NodeRSA from 'node-rsa';
import { v4 as uuidV4 } from 'uuid';
import { RsaDto } from './dto/rsa-dto';

@Injectable()
export class SysService {
  constructor(
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    @Inject('KEYS_STORE') private readonly keys: Map<string, NodeRSA>,
  ) {}

  /** 发送注册邮箱验证码 */
  async sendMailForRegister(email: string) {
    const { code } = await this.mailService.sendRegisterCode(email);
    const redisKey = getRedisKey(RedisKeyPrefix.REGISTER_CODE, email);
    await this.redisService.set(redisKey, code, 5 * 60); // 设置验证码有效期为5分钟
    return ResponseDto.success();
  }

  /**
   * 生成一对 RSA 密钥，并返回公钥和密钥标识
   */
  createRsaKeyPair(key_id?: string) {
    if (key_id && this.keys.has(key_id)) {
      return ResponseDto.success<RsaDto>({
        key_id,
        public_key: this.keys.get(key_id)!.exportKey('public'),
      });
    }
    const key = new NodeRSA({ b: 2048 });
    key.setOptions({ encryptionScheme: 'pkcs1_oaep' });
    const publicKey = key.exportKey('public');
    const keyId = uuidV4();
    this.keys.set(keyId, key);
    return ResponseDto.success<RsaDto>({
      key_id: keyId,
      public_key: publicKey,
    });
  }

  /** 解密 */
  decrypt(keyId: string, encryptedData: string) {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new UnauthorizedException('无效的密钥标识');
    }
    const data = key.decrypt(encryptedData, 'utf8');
    return data;
  }
}
