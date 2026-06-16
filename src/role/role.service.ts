import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleListDto } from './dto/role-list.dto';
import { ListResult } from 'src/common/utils';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { RoleMenu } from './entities/role-menu.entity';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { RoleMenusDto } from './dto/role-menus.dto';
import { UserRole } from 'src/user/entities/user-role.entity';
import { getRedisKey } from 'src/common/utils/redis';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: RoleCreateDto) {
    await this.roleRepository.save(dto);
    return ResponseDto.success();
  }

  async list(dto: RoleListDto) {
    const { current, pageSize } = dto;
    const [list, total] = await this.roleRepository
      .createQueryBuilder('r')
      .andWhere('r.deletedAt IS NULL')
      .orderBy('r.updatedAt', 'DESC')
      .skip((current - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return new ListResult(list, total);
  }

  async all() {
    const list = await this.roleRepository
      .createQueryBuilder('r')
      .select(['r.id As id', 'r.name As name'])
      .andWhere('r.deletedAt IS NULL')
      .orderBy('r.updatedAt', 'DESC')
      .getRawMany();
    return new ListResult(list, list.length);
  }

  async update(dto: RoleUpdateDto) {
    const { id, ...rest } = dto;
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException('角色不存在或已被删除');
    }
    if (role.builtIn) {
      throw new ForbiddenException('内置角色不允许修改');
    }
    await this.roleRepository.update(id, rest);
    return ResponseDto.success();
  }

  async delete(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (role?.builtIn) {
      throw new ForbiddenException('内置角色不允许删除');
    }
    await this.roleRepository.softDelete(id);
    return ResponseDto.success();
  }

  async menus(roleId: number): Promise<number[]> {
    const roleMenus = await this.roleMenuRepository.find({
      where: { roleId },
    });
    return roleMenus.map((rm) => rm.menuId);
  }

  /** 为角色分配菜单权限 */
  async assignMenus(dto: RoleMenusDto) {
    const { roleId, menuIds } = dto;
    await this.roleMenuRepository.delete({ roleId });
    // 清除受影响的用户权限缓存
    const affectedUsers = await this.userRoleRepository.find({
      where: { roleId },
    });
    for (const u of affectedUsers) {
      const key = getRedisKey(RedisKeyPrefix.USER_PERMS, u.userId);
      await this.redisService.del(key);
    }
    if (menuIds.length > 0) {
      const roleMenus = menuIds.map((menuId) =>
        this.roleMenuRepository.create({ roleId, menuId }),
      );
      await this.roleMenuRepository.save(roleMenus);
    }
    return ResponseDto.success();
  }

  /** 创建游客角色 */
  async createGuestRole() {
    let guestRole = await this.roleRepository.findOne({
      where: { name: '游客' },
    });
    if (!guestRole) {
      guestRole = await this.roleRepository.save({
        name: '游客',
        remark: '系统内置角色（游客）',
        builtIn: true,
      });
    }
    return guestRole;
  }
}
