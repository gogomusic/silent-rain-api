import { ApiProperty } from '@nestjs/swagger';
import { DictItemCreateDto } from './dict-item-create.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DictItemUpdateDto extends DictItemCreateDto {
  @ApiProperty({ description: 'ID' })
  @IsNotEmpty()
  @IsInt()
  id: number;
}
