import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
