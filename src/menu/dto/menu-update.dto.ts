import { ApiProperty } from '@nestjs/swagger';
import { MenuCreateDto } from './menu-create.dto';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Exclude, Type } from 'class-transformer';

export class MenuUpdateDto extends MenuCreateDto {
  @ApiProperty({ description: 'id' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;
}
