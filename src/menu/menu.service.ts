import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { DataSource, Repository } from 'typeorm';
import { ListResult } from 'src/common/utils';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { MenuCreateDto } from './dto/menu-create.dto';
import { MenuUpdateDto } from './dto/menu-update.dto';
import { MenuType, UserType } from 'src/common/enums/common.enum';
import { RedisService } from 'src/common/redis/redis.service';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { getRedisKey } from 'src/common/utils/redis';

@Injectable()
export class MenuService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: MenuCreateDto) {
    await this.menuRepository.save(dto);
    return ResponseDto.success();
  }

  async update(dto: MenuUpdateDto) {
    const { id, ...rest } = dto;
    await this.menuRepository.update(id, rest);
    return ResponseDto.success();
  }

  async list() {
    const [list, total] = await this.menuRepository
      .createQueryBuilder()
      .getManyAndCount();
    return new ListResult(list, total);
  }

  async simpleList() {
    const [list, total] = await this.menuRepository.findAndCount({
      select: {
        id: true,
        name: true,
        pid: true,
        sort: true,
        icon: true,
        type: true,
        status: true,
      },
    });
    return new ListResult(
      list.filter((i) => i.status),
      total,
    );
  }

  async delete(id: number) {
    await this.menuRepository.delete(id);
    return ResponseDto.success();
  }

  /** 查找用户拥有的所有权限 */
  async findUserApis(userId: number): Promise<string[]> {
    const cacheKey = getRedisKey(RedisKeyPrefix.USER_PERMS, userId);
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const permsResult = await this.dataSource
      .createQueryBuilder()
      .select(['DISTINCT m.permission AS permission'])
      .from('user_role', 'ur')
      .leftJoin('role_menu', 'rm', 'ur.role_id = rm.role_id')
      .leftJoin('menu', 'm', 'rm.menu_id = m.id')
      .where('ur.user_id = :userId', { userId })
      .andWhere('m.permission IS NOT NULL')
      .getRawMany();
    const permissions = permsResult.map((item) => item.permission);

    // 缓存5分钟，角色权限不常变更
    await this.redisService.set(cacheKey, JSON.stringify(permissions), 300);
    return permissions;
  }

  /** 获取当前登录用户的菜单 */
  async getCurrentUserMenu(userId: number, type: UserType): Promise<Menu[]> {
    // 超管拥有所有菜单权限，无需按角色过滤
    if (type === UserType.ADMIN_USER) {
      return this.menuRepository.find({
        where: { type: MenuType.MENU, status: true },
        order: { sort: 'ASC' },
      });
    }

    return this.menuRepository
      .createQueryBuilder('m')
      .innerJoin('role_menu', 'rm', 'rm.menu_id = m.id')
      .innerJoin('user_role', 'ur', 'ur.role_id = rm.role_id')
      .where('ur.user_id = :userId', { userId })
      .andWhere('m.type = :type', { type: MenuType.MENU })
      .andWhere('m.status = :status', { status: true })
      .orderBy('m.sort', 'ASC')
      .getMany();
  }
}
