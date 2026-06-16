import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleMenu } from './entities/role-menu.entity';
import { UserRole } from 'src/user/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RoleMenu, UserRole])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
