import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiOperation, ApiTags, PickType } from '@nestjs/swagger';
import {
  LogAction,
  LogModule,
} from 'src/common/decorators/operation.decorator';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { Menu } from './entities/menu.entity';
import { AllowNoPermission } from 'src/common/decorators/permission.decorator';

class MenuSimpleVo extends PickType(Menu, [
  'id',
  'name',
  'pid',
  'icon',
  'type',
] as const) {}

@ApiTags('菜单 /menu')
@LogModule('菜单')
@Controller('menu')
@UseInterceptors(ClassSerializerInterceptor)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({
    summary: '创建菜单',
  })
  @LogAction('创建菜单')
  @Post('create')
  @ApiGenericResponse()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({
    summary: '编辑菜单',
  })
  @LogAction('编辑菜单')
  @Patch('update')
  @ApiGenericResponse()
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({
    summary: '菜单列表',
  })
  @ApiGenericResponse({
    model: Menu,
    isList: true,
  })
  @Post('list')
  list() {
    return this.menuService.list();
  }

  @ApiOperation({
    summary: '简要菜单列表（分配角色权限时使用）',
  })
  @ApiGenericResponse({
    model: MenuSimpleVo,
    isList: true,
  })
  @AllowNoPermission()
  @Post('simpleList')
  simpleList() {
    return this.menuService.simpleList();
  }

  @ApiOperation({
    summary: '删除菜单',
  })
  @LogAction('删除菜单')
  @ApiGenericResponse()
  @Delete('delete')
  delete(@Query('id') id: number) {
    return this.menuService.delete(+id);
  }
}
