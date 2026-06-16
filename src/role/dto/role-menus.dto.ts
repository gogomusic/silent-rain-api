import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

/** 分配角色菜单权限 */
export class RoleMenusDto {
  @ApiProperty({ description: '角色ID' })
  @IsInt({ message: '角色ID必须为整数' })
  @IsNotEmpty({ message: '角色ID不能为空' })
  roleId: number;

  @ApiProperty({
    description: '菜单ID列表',
    type: [Number],
  })
  @IsArray({ message: '菜单ID列表格式错误' })
  @IsInt({ each: true, message: '菜单ID必须为整数' })
  menuIds: number[];
}
