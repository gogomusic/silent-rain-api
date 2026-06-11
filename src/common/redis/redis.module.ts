import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constant';

const createRedisClient = async (configService: ConfigService) => {
  return await createClient({
    socket: {
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
    },
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
  }).connect();
};

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: createRedisClient,
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
