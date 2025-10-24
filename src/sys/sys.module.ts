import { Module, forwardRef } from '@nestjs/common';
import { SysService } from './sys.service';
import { SysController } from './sys.controller';
import { MailModule } from 'src/common/mail/mail.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import NodeRSA from 'node-rsa';

const key = new NodeRSA({ b: 2048 });
key.setOptions({ encryptionScheme: 'pkcs1_oaep' });
const public_key = key.exportKey('public');

@Module({
  imports: [MailModule, RedisModule, forwardRef(() => UserModule)],
  controllers: [SysController],
  providers: [
    SysService,
    {
      provide: 'RSA_STORE',
      useValue: {
        key,
        public_key,
      },
    },
  ],
  exports: [SysService],
})
export class SysModule {}
