import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { DictService } from './dict.service';
import { DictSseService } from './dict-sse.service';
import { LogAction, LogModule } from 'src/common/logger/operation.decorator';
import { ApiResponse } from 'src/common/swagger/api-response.decorator';
import { DictTypeCreateDto } from './dto/dict-type-create.dto';
import { DictTypeUpdateDto } from './dto/dict-type-update.dto';
import { DictTypeListDto } from './dto/dict-type-list.dto';
import { DictItemCreateDto } from './dto/dict-item-create.dto';
import { DictItemUpdateDto } from './dto/dict-item-update.dto';
import { DictType } from './entities/dict-type.entity';
import { DictItem } from './entities/dict-item.entity';
import { IntIdQueryDto } from 'src/common/dto/query.dto';
import { AllowNoPermission } from 'src/auth/token.decorator';

@ApiTags('字典管理 /dict')
@LogModule('字典管理')
@Controller('dict')
export class DictController {
  constructor(
    private readonly dictService: DictService,
    private readonly dictSseService: DictSseService,
  ) {}

  // ======================== 🌟 SSE 实时推送端点 ========================
  @ApiOperation({
    summary: '字典变更 SSE 流',
    description: '建立 SSE 长连接，当字典数据变更时自动推送最新数据',
  })
  @AllowNoPermission()
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.dictSseService.getStream();
  }

  // ======================== 字典类型 ========================

  @ApiOperation({ summary: '创建字典类型' })
  @LogAction('创建字典类型')
  @ApiResponse()
  @Post('typeCreate')
  createType(@Body() dto: DictTypeCreateDto) {
    return this.dictService.createType(dto);
  }

  @ApiOperation({ summary: '编辑字典类型' })
  @LogAction('编辑字典类型')
  @ApiResponse()
  @Patch('typeUpdate')
  updateType(@Body() dto: DictTypeUpdateDto) {
    return this.dictService.updateType(dto);
  }

  @ApiOperation({ summary: '字典类型列表' })
  @ApiResponse({ model: DictType, isList: true })
  @Post('typeList')
  listType(@Body() dto: DictTypeListDto) {
    return this.dictService.listType(dto);
  }

  @ApiOperation({ summary: '所有启用的字典类型' })
  @ApiResponse({ model: DictType, isList: true })
  @AllowNoPermission()
  @Get('typeAll')
  allTypes() {
    return this.dictService.allTypes();
  }

  @ApiOperation({ summary: '删除字典类型' })
  @LogAction('删除字典类型')
  @ApiResponse()
  @Delete('typeDelete')
  deleteType(@Query() { id }: IntIdQueryDto) {
    return this.dictService.deleteType(id);
  }

  // ======================== 字典项 ========================

  @ApiOperation({ summary: '创建字典项' })
  @LogAction('创建字典项')
  @ApiResponse()
  @Post('itemCreate')
  createItem(@Body() dto: DictItemCreateDto) {
    return this.dictService.createItem(dto);
  }

  @ApiOperation({ summary: '编辑字典项' })
  @LogAction('编辑字典项')
  @ApiResponse()
  @Patch('itemUpdate')
  updateItem(@Body() dto: DictItemUpdateDto) {
    return this.dictService.updateItem(dto);
  }

  @ApiOperation({ summary: '字典项列表' })
  @ApiResponse({ model: DictItem, isList: true })
  @Get('itemList')
  listItem(@Query() { id: typeId }: IntIdQueryDto) {
    return this.dictService.listItem(typeId);
  }

  @ApiOperation({ summary: '删除字典项' })
  @LogAction('删除字典项')
  @ApiResponse()
  @Delete('itemDelete')
  deleteItem(@Query() { id }: IntIdQueryDto) {
    return this.dictService.deleteItem(id);
  }

  // ======================== 🌟 前端按 code 获取字典数据 ========================

  @ApiOperation({
    summary: '按编码获取字典数据',
    description:
      '根据字典编码返回字典项列表，禁用的字典也会返回，需要前端做处理，示例：/api/dict/data?code=gender',
  })
  @ApiResponse({ model: DictItem, isArray: true })
  @AllowNoPermission()
  @Get('data')
  getDictData(@Query('code') code: string) {
    return this.dictService.getDictByCode(code);
  }
}
