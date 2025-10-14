import { Module, forwardRef } from '@nestjs/common';
import { SysService } from './sys.service';
import { SysController } from './sys.controller';
import { MailModule } from 'src/common/mail/mail.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MailModule, RedisModule, forwardRef(() => UserModule)],
  controllers: [SysController],
  providers: [
    SysService,
    {
      provide: 'KEYS_STORE',
      useValue: new Map<string, any>(),
    },
  ],
  exports: [SysService],
})
export class SysModule {}
