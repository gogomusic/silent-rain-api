import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { StatusEnum } from 'src/common/enum/common.enum';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  remark?: string;

  @ApiProperty({
    description: '状态：1:启用，0:禁用',
    default: 1,
    enum: StatusEnum,
    enumName: 'RoleStatusEnum',
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  @Type(() => Number)
  status?: StatusEnum;

  @ApiProperty({
    description: '权限ID列表',
    type: 'array',
    items: { type: 'number' },
    required: false,
  })
  @IsOptional()
  permissions?: number[];
}
