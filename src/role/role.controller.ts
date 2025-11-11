import {
  Controller,
  Delete,
  Post,
  Body,
  Query,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  LogAction,
  LogModule,
} from 'src/common/decorators/operation.decorator';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { Role } from './entities/role.entity';
import { RoleListDto } from './dto/role-list.dto';
import { AllRolesVo } from './dto/all-roles.vo';
import { AllowNoPermission } from 'src/common/decorators/permission.decorator';

@ApiTags('角色 /role')
@LogModule('角色')
@Controller('role')
@UseInterceptors(ClassSerializerInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: '创建角色',
  })
  @LogAction('创建角色')
  @Post('create')
  @ApiGenericResponse()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({
    summary: '角色列表',
  })
  @ApiGenericResponse({
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
  @ApiGenericResponse({
    model: AllRolesVo,
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
  @ApiGenericResponse()
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  @ApiOperation({
    summary: '删除角色',
  })
  @LogAction('删除角色')
  @ApiGenericResponse()
  @Delete('delete')
  delete(@Query('id') id: number) {
    return this.roleService.delete(+id);
  }

  @ApiOperation({
    summary: '获取角色关联的菜单ID列表',
  })
  @ApiGenericResponse({
    model: Number,
    isArray: true,
  })
  @Get('menus')
  menus(@Query('id') id: number) {
    return this.roleService.menus(+id);
  }
}
