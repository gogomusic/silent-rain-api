import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { DataSource, Repository } from 'typeorm';
import { ListResult } from 'src/common/utils';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { MenuType, StatusEnum } from 'src/common/enum/common.enum';

@Injectable()
export class MenuService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    await this.menuRepository.save(createMenuDto);
    return ResponseDto.success();
  }

  async update(updateMenuDto: UpdateMenuDto) {
    const { id, ...rest } = updateMenuDto;
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
    const [list, total] = await this.menuRepository
      .createQueryBuilder('m')
      .select(['m.id', 'm.name', 'm.pid', 'm.sort', 'm.icon', 'm.type'])
      .getManyAndCount();
    return { list, total };
  }

  async delete(id: number) {
    await this.menuRepository.softDelete(id);
    return ResponseDto.success();
  }

  /** 查找用户拥有的所有权限 */
  async findUserApis(userId: number): Promise<string[]> {
    const permsResult = await this.dataSource
      .createQueryBuilder()
      .select(['m.permission AS permission'])
      .from('user_role', 'ur')
      .leftJoin('role_menu', 'rm', 'ur.role_id = rm.role_id')
      .leftJoin('menu', 'm', 'rm.menu_id = m.id')
      .where('ur.user_id = :userId', { userId })
      .andWhere('m.permission IS NOT NULL')
      .getRawMany();
    return permsResult.map((item) => item.permission);
  }

  async getCurrentUserMenu(userId: number): Promise<Menu[]> {
    const menus: Menu[] = await this.dataSource
      .createQueryBuilder()
      .select(['m.*'])
      .from('user_role', 'ur')
      .leftJoin('role_menu', 'rm', 'ur.role_id = rm.role_id')
      .leftJoin('menu', 'm', 'rm.menu_id = m.id')
      .where('ur.user_id = :userId', { userId })
      .orderBy('m.sort', 'ASC')
      .getRawMany();
    return menus.filter(
      (item) =>
        item.type === MenuType.MENU && item.status === StatusEnum.ENABLED,
    );
  }
}
