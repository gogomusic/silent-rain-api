import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { LogAction, LogModule } from 'src/common/logger/operation.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/swagger/api-response.decorator';
import { MenuCreateDto } from './dto/menu-create.dto';
import { MenuUpdateDto } from './dto/menu-update.dto';
import { Menu } from './entities/menu.entity';
import { MenuSimpleVo } from './vo/menu-simple.vo';
import { AllowNoPermission } from 'src/auth/token.decorator';
import { IntIdQueryDto } from 'src/common/dto/query.dto';

@ApiTags('菜单管理 /menu')
@LogModule('菜单管理')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({
    summary: '创建菜单',
  })
  @LogAction('创建菜单')
  @ApiResponse()
  @Post('create')
  create(@Body() menuCreateDto: MenuCreateDto) {
    return this.menuService.create(menuCreateDto);
  }

  @ApiOperation({
    summary: '编辑菜单',
  })
  @LogAction('编辑菜单')
  @ApiResponse()
  @Patch('update')
  update(@Body() updateMenuDto: MenuUpdateDto) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({
    summary: '菜单列表',
  })
  @ApiResponse({
    model: Menu,
    isList: true,
  })
  @Get('list')
  list() {
    return this.menuService.list();
  }

  @ApiOperation({
    summary: '简要菜单列表',
  })
  @ApiResponse({
    model: MenuSimpleVo,
    isList: true,
  })
  @AllowNoPermission()
  @Get('simpleList')
  simpleList() {
    return this.menuService.simpleList();
  }

  @ApiOperation({
    summary: '删除菜单',
  })
  @LogAction('删除菜单')
  @ApiResponse()
  @Delete('delete')
  delete(@Query() { id }: IntIdQueryDto) {
    return this.menuService.delete(id);
  }
}
