import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class RoleCreateDto {
  @ApiProperty({ description: '角色名称' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  remark?: string;

  @ApiProperty({
    description: '状态',
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: '权限ID列表',
    type: 'array',
    items: { type: 'number' },
    required: false,
  })
  @IsOptional()
  permissions?: number[];
}
