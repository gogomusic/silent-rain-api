import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './common/mail/mail.module';
import { RedisModule } from './common/redis/redis.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './common/logger/logger.module';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { HttpExceptionFilter } from './common/http/http-exception.filter';
import { LogModule } from './log/log.module';
import { LoggerInterceptor } from './common/logger/logger.interceptor';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFile,
      cache: true,
      validationSchema: Joi.object({
        // 环境变量
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().port().required(),
        // MySQL
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().port().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
        // Email
        EMAIL_HOST: Joi.string().required(),
        EMAIL_PORT: Joi.number().port().required(),
        EMAIL_SECURE: Joi.boolean().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASS: Joi.string().required(),
        EMAIL_LIMIT_DAY: Joi.number().integer().min(1).required(),
        EMAIL_LIMIT_HOUR: Joi.number().integer().min(1).required(),
        // Redis
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().port().required(),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        // 文件上传
        FILE_UPLOAD_DIR: Joi.string().required(),
        FILE_UPLOAD_LIMIT_MB: Joi.number().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get('NODE_ENV') === 'development';
        return {
          type: 'mysql',
          host: configService.get('MYSQL_HOST'),
          port: Number(configService.get('MYSQL_PORT')),
          username: configService.get('MYSQL_USER'),
          password: configService.get('MYSQL_PASSWORD'),
          database: configService.get('MYSQL_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          charset: 'utf8mb4',
          autoLoadEntities: true,
          synchronize: true, // 生产环境中禁止开启，应该使用数据迁移
          logger: isDev ? 'advanced-console' : undefined,
          logging: isDev,
        };
      },
    }),
    UserModule,
    AuthModule,
    RedisModule,
    MailModule,
    LoggerModule,
    LogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('{*path}');
  }
}
