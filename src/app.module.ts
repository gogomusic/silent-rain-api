import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SysModule } from './sys/sys.module';
import Joi from 'joi';

console.log('环境：', process.env.NODE_ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
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
