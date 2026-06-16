import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UserSetRolesDto {
  @ApiProperty({ description: 'id' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: '角色列表',
    required: true,
    type: 'array',
    items: { type: 'number' },
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roles: number[] = [];
}
