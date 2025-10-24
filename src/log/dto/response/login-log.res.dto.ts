import { ApiProperty } from '@nestjs/swagger';
import { LoginType } from 'src/common/enum/common.enum';

export class LoginLogResDto {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '用户ID' })
  user_id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  nickname: string;

  @ApiProperty({
    description: '登录类型 0退出系统 1登录系统',
    enum: LoginType,
  })
  type: LoginType;

  @ApiProperty({ description: 'IP地址' })
  ip: string;

  @ApiProperty({ description: '设备' })
  device: string;

  @ApiProperty({ description: '浏览器' })
  browser: string;

  @ApiProperty({ description: '操作系统' })
  os: string;

  @ApiProperty({ description: '用户代理' })
  user_agent: string;

  @ApiProperty({ description: '创建时间' })
  create_time: Date;
}
