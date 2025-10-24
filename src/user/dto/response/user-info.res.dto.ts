import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum, UserType } from 'src/common/enum/common.enum';
import { FileBaseDto } from 'src/common/file/dto/file-base.dto';

export class UserInfoResDto {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  nickname: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({
    description: '用户类型 0超级管理员 1普通用户',
    enum: UserType,
  })
  user_type: UserType;

  @ApiProperty({
    description: '用户状态 0停用 1启用',
    enum: StatusEnum,
  })
  status: StatusEnum;

  @ApiProperty({ description: '角色' })
  roles: number[];

  @ApiProperty({ description: '头像' })
  avatar: number;

  @ApiProperty({
    description: '头像详情',
  })
  avatar_info: FileBaseDto;

  @ApiProperty({ description: '描述' })
  description: string;

  @ApiProperty({ description: '创建时间' })
  create_time: Date;

  @ApiProperty({ description: '更新时间' })
  update_time: Date;
}
