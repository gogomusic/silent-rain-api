import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePwdDto {
  @ApiProperty({ description: '旧密码' })
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码', minLength: 6 })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;

  @ApiProperty({ description: '确认新密码' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmNewPassword: string;
}
