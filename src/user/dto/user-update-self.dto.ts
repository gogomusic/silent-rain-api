import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class UserUpdateSelfDto {
  @ApiProperty({ description: 'ID' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsInt()
  avatar?: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  description?: string;
}
