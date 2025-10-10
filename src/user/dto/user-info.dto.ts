import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '用户类型 0超级管理员 1普通用户' })
  userType: 0 | 1;

  @ApiProperty({ description: '用户状态 0停用 1启用' })
  status: number;

  @ApiProperty({ description: '头像' })
  avatar: number;

  @ApiProperty({ description: '描述' })
  desc: string;

  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  updateTime: Date;
}
