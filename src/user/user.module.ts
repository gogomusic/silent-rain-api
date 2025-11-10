import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisModule } from 'src/common/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SysModule } from 'src/sys/sys.module';
import { UserRole } from './entities/user-role.entity';
import { MenuModule } from 'src/menu/menu.module';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([User, UserRole]),
    forwardRef(() => SysModule),
    MenuModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
