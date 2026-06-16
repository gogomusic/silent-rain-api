import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogAction, LogModule } from 'src/common/logger/operation.decorator';
import { ApiResponse } from 'src/common/swagger/api-response.decorator';
import { RoleCreateDto } from './dto/role-create.dto';
import { Role } from './entities/role.entity';
import { RoleListDto } from './dto/role-list.dto';
import { RoleSelectVo } from './dto/role-select.vo';
import { AllowNoPermission } from 'src/auth/token.decorator';
import { RoleUpdateDto } from './dto/role-update.dto';
import { IntIdQueryDto } from 'src/common/dto/query.dto';
import { RoleMenusDto } from './dto/role-menus.dto';

@ApiTags('角色管理 /role')
@LogModule('角色管理')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: '创建角色',
  })
  @LogAction('创建角色')
  @Post('create')
  @ApiResponse()
  create(@Body() roleCreateDto: RoleCreateDto) {
    return this.roleService.create(roleCreateDto);
  }

  @ApiOperation({
    summary: '角色列表',
  })
  @ApiResponse({
    model: Role,
    isList: true,
  })
  @Post('list')
  list(@Body() dto: RoleListDto) {
    return this.roleService.list(dto);
  }

  @ApiOperation({
    summary: '角色下拉列表',
    description: '不分页，返回所有角色',
  })
  @ApiResponse({
    model: RoleSelectVo,
    isList: true,
  })
  @AllowNoPermission()
  @Get('all')
  all() {
    return this.roleService.all();
  }

  @ApiOperation({
    summary: '编辑角色',
  })
  @LogAction('编辑角色')
  @Patch('update')
  @ApiResponse()
  update(@Body() roleUpdateDto: RoleUpdateDto) {
    return this.roleService.update(roleUpdateDto);
  }

  @ApiOperation({
    summary: '删除角色',
  })
  @LogAction('删除角色')
  @ApiResponse()
  @Delete('delete')
  delete(@Query() { id }: IntIdQueryDto) {
    return this.roleService.delete(id);
  }

  @ApiOperation({
    summary: '获取角色关联的菜单ID列表',
  })
  @ApiResponse({
    model: Number,
    isArray: true,
  })
  @AllowNoPermission()
  @Get('menus')
  menus(@Query() { id }: IntIdQueryDto) {
    return this.roleService.menus(id);
  }

  @ApiOperation({
    summary: '分配角色权限',
    description: '全量覆盖：传入的菜单ID列表将替换该角色原有的所有菜单权限',
  })
  @LogAction('分配角色权限')
  @ApiResponse()
  @Put('menus')
  assignMenus(@Body() dto: RoleMenusDto) {
    return this.roleService.assignMenus(dto);
  }
}
