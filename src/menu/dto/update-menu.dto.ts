import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiProperty({ description: 'id' })
  @IsInt()
  @Type(() => Number)
  id: number;
}
