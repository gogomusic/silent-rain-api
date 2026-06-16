import { PickType } from '@nestjs/swagger';
import { Menu } from '../entities/menu.entity';

export class MenuSimpleVo extends PickType(Menu, [
  'id',
  'name',
  'pid',
  'icon',
  'type',
] as const) {}
