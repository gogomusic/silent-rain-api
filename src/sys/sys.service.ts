import { Injectable } from '@nestjs/common';
import { CreateSyDto } from './dto/create-sy.dto';
import { UpdateSyDto } from './dto/update-sy.dto';

@Injectable()
export class SysService {
  create(createSyDto: CreateSyDto) {
    return 'This action adds a new sy';
  }

  findAll() {
    return `This action returns all sys`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sy`;
  }

  update(id: number, updateSyDto: UpdateSyDto) {
    return `This action updates a #${id} sy`;
  }

  remove(id: number) {
    return `This action removes a #${id} sy`;
  }
}
