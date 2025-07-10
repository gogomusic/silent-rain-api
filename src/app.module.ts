import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SysModule } from './sys/sys.module';
import { UserModule } from './user/user.module';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFilePath = `.env.${NODE_ENV}`;
console.log('环境：', NODE_ENV);
console.log('配置文件：', envFilePath);

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
        PORT: Joi.number().port().default(3000),
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
          synchronize: NODE_ENV === 'development', // 生产环境中禁止开启，应该使用数据迁移
        };
      },
    }),
    SysModule,
    UserModule,
  ],
})
export class AppModule {}
