import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/common/mail/mail.module';
import { MenuModule } from 'src/menu/menu.module';
import { RoleModule } from 'src/role/role.module';
import { UserRole } from './entities/user-role.entity';
import { FileModule } from 'src/common/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    forwardRef(() => AuthModule),
    MailModule,
    MenuModule,
    RoleModule,
    FileModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
