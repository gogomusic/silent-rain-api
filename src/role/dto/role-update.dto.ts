import { ApiProperty } from '@nestjs/swagger';
import { RoleCreateDto } from './role-create.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class RoleUpdateDto extends RoleCreateDto {
  @ApiProperty({ description: '角色ID' })
  @IsNotEmpty()
  @IsInt()
  id: number;
}
