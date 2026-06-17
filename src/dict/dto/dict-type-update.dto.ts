import { ApiProperty } from '@nestjs/swagger';
import { DictTypeCreateDto } from './dict-type-create.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DictTypeUpdateDto extends DictTypeCreateDto {
  @ApiProperty({ description: 'ID' })
  @IsNotEmpty()
  @IsInt()
  id: number;
}
