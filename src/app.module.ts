import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFile,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().port().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().port().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
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
    UsersModule,
  ],
})
export class AppModule {}
