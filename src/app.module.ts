import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SysModule } from './sys/sys.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production.local'
          : '.env.development.local',
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
    SysModule,
  ],
})
export class AppModule {}
