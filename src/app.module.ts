import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SysModule } from './sys/sys.module';
import { UserModule } from './user/user.module';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './common/auth/auth.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { RoleAuthGuard } from './common/auth/role-auth.guard';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { FileModule } from './common/file/file.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { ResponseInterceptor } from './common/http/response-interceptor';
import { DateFormatInterceptor } from './common/interceptors/date-format.interceptor';
import { HttpExceptionFilter } from './common/http/http-exception.filter';
import { LogModule } from './log/log.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './common/logger/logger.interceptor';
import { FormDataInterceptor } from './common/file/form-data.interceptor';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';
const PORT = process.env.PORT || 9161;
const envFilePath = `.env.${NODE_ENV}`;
console.info('\n环境：', NODE_ENV);
console.info('配置文件：', `${envFilePath}\n`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().port().default(PORT),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get('MYSQL_HOST'),
          port: config.get('MYSQL_PORT'),
          username: config.get('MYSQL_USER'),
          password: config.get('MYSQL_PASSWORD'),
          database: config.get('MYSQL_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          charset: 'utf8mb4',
          autoLoadEntities: true,
          synchronize: isDev, // 生产环境中禁止开启，应该使用数据迁移
          logger: isDev ? 'advanced-console' : undefined,
          logging: isDev,
        };
      },
    }),
    SysModule,
    UserModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    FileModule,
    LoggerModule,
    LogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FormDataInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DateFormatInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
