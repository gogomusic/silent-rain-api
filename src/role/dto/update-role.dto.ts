import { ApiProperty } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty({ description: '角色ID' })
  @IsNotEmpty()
  id: number;
}
