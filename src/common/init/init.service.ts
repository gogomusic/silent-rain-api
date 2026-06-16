import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/role/entities/role.entity';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/entities/user-role.entity';
import { UserType } from 'src/common/enums/common.enum';

/**
 * 系统初始化服务
 *
 * 在应用启动时自动执行，用于创建初始数据（角色、管理员账号等）。
 * 所有操作均为幂等的：仅当数据不存在时才会创建。
 * 后续需要新增初始化内容，直接在本服务的 onApplicationBootstrap 中追加即可。
 */
@Injectable()
export class InitService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.initRoles();
    await this.initAdminUser();
  }

  /** 初始化内置角色 */
  private async initRoles() {
    const adminRole = await this.roleRepository.findOneBy({ name: '管理员' });
    if (!adminRole) {
      await this.roleRepository.save({
        name: '管理员',
        remark: '系统内置角色（管理员）',
        builtIn: true,
      });
    }

    const guestRole = await this.roleRepository.findOneBy({ name: '游客' });
    if (!guestRole) {
      await this.roleRepository.save({
        name: '游客',
        remark: '系统内置角色（游客）',
        builtIn: true,
      });
    }
  }

  /** 初始化超级管理员用户 */
  private async initAdminUser() {
    const defaultAdminUsername = this.configService.get<string>(
      'DEFAULT_ADMIN_USERNAME',
    );
    const defaultAdminPassword = this.configService.get<string>(
      'DEFAULT_ADMIN_PASSWORD',
    );

    const exists = await this.userRepository.findOneBy({
      username: defaultAdminUsername,
    });
    if (exists) return;

    const hashedPassword = await bcrypt.hash(defaultAdminPassword!, 10);
    const adminUser = await this.userRepository.save({
      username: defaultAdminUsername,
      nickname: '超级管理员',
      password: hashedPassword,
      email: this.configService.get<string>('DEFAULT_ADMIN_EMAIL'),
      type: UserType.ADMIN_USER,
      status: true,
    });

    // 为超管分配管理员角色
    const adminRole = await this.roleRepository.findOneBy({ name: '管理员' });
    if (adminRole) {
      await this.userRoleRepository.save({
        userId: adminUser.id,
        roleId: adminRole.id,
      });
    }
  }
}
