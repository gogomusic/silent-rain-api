import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

const createRedisClient = async (configService: ConfigService) => {
  return await createClient({
    socket: {
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
    },
  }).connect();
};

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'NEST_REDIS',
      inject: [ConfigService],
      useFactory: createRedisClient,
    },
  ],
  exports: ['NEST_REDIS', RedisService],
})
export class RedisModule {}
