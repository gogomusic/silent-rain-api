import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class SetRolesDto {
  @ApiProperty({ description: 'id' })
  @IsInt()
  id: number;

  @ApiProperty({
    description: '角色列表',
    required: true,
    type: 'array',
    items: { type: 'number' },
  })
  @IsOptional()
  roles: number[] = [];
}
