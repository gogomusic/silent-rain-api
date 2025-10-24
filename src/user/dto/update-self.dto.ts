import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSelfDto {
  @ApiProperty({ description: 'id' })
  @IsInt()
  id: number;

  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname: string;

  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  avatar?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  description?: string;
}
