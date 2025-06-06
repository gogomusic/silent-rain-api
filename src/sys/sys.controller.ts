import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SysService } from './sys.service';
import { CreateSyDto } from './dto/create-sy.dto';
import { UpdateSyDto } from './dto/update-sy.dto';

@Controller('sys')
export class SysController {
  constructor(private readonly sysService: SysService) {}

  @Post()
  create(@Body() createSyDto: CreateSyDto) {
    return this.sysService.create(createSyDto);
  }

  @Get()
  findAll() {
    return this.sysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sysService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSyDto: UpdateSyDto) {
    return this.sysService.update(+id, updateSyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sysService.remove(+id);
  }
}
