import { ApiProperty } from '@nestjs/swagger';
import { OperationResultEnum } from 'src/common/enum/common.enum';

export class OperationLogResDto {
  @ApiProperty({ description: 'id' })
  id: number;

  @ApiProperty({ description: '用户ID' })
  user_id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  nickname: string;

  @ApiProperty({ description: '模块' })
  module: string;

  @ApiProperty({ description: '操作' })
  action: string;

  @ApiProperty({ description: '请求方式' })
  method: string;

  @ApiProperty({ description: '请求接口' })
  url: string;

  @ApiProperty({ description: '请求参数' })
  params?: string;

  @ApiProperty({ description: '操作结果', enum: OperationResultEnum })
  status: OperationResultEnum;

  @ApiProperty({ description: '响应时间（ms）' })
  duration?: number;

  @ApiProperty({ description: '异常信息' })
  fail_result?: string;

  @ApiProperty({ description: 'IP地址' })
  ip: string;

  @ApiProperty({ description: '设备' })
  device?: string;

  @ApiProperty({ description: '浏览器' })
  browser?: string;

  @ApiProperty({ description: '操作系统' })
  os?: string;

  @ApiProperty({ description: '用户代理' })
  user_agent?: string;

  @ApiProperty({ description: '创建时间' })
  create_time: Date;
}
