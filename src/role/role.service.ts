import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleListDto } from './dto/role-list.dto';
import { ListResult } from 'src/common/utils';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { RoleMenu } from './entities/role-menu.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissions: menu_ids, ...roleData } = createRoleDto;
    return this.roleRepository.save(roleData);
  }

  async list(dto: RoleListDto) {
    const { current, pageSize } = dto || {};
    const [list, total] = await this.roleRepository
      .createQueryBuilder('r')
      .orderBy('r.updated_at', 'DESC')
      .skip((current - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return new ListResult(list, total);
  }

  async all() {
    const list = await this.roleRepository
      .createQueryBuilder('r')
      .select(['r.id As id', 'r.name As name'])
      .orderBy('r.updated_at', 'DESC')
      .getRawMany();
    return new ListResult(list, list.length);
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const { id, permissions, ...rest } = updateRoleDto;
    await this.roleRepository.update(id, rest);
    await this.roleMenuRepository.delete({ role_id: id });
    if (permissions && permissions.length > 0) {
      const roleMenus = permissions.map((menu_id) => ({
        role_id: id,
        menu_id,
      }));
      await this.roleMenuRepository.save(roleMenus);
    }
    return ResponseDto.success();
  }

  async delete(id: number) {
    await this.roleRepository.softDelete(id);
    return ResponseDto.success();
  }

  async menus(roleId: number): Promise<number[]> {
    const roleMenus = await this.roleMenuRepository.find({
      where: { role_id: roleId },
    });
    console.log(roleMenus);
    return roleMenus.map((rm) => rm.menu_id);
  }
}
