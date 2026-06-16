import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/entities/user-role.entity';
import { InitService } from './init.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, UserRole])],
  providers: [InitService],
})
export class InitModule {}
