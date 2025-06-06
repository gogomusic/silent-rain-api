import { Module } from '@nestjs/common';
import { SysService } from './sys.service';
import { SysController } from './sys.controller';
import { MailModule } from 'src/common/mail/mail.module';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [MailModule, RedisModule],
  controllers: [SysController],
  providers: [SysService],
})
export class SysModule {}
