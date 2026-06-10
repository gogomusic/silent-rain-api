import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPwdDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;

  @ApiProperty({ description: '新密码', minLength: 6 })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @IsNotEmpty({ message: '新密码不能为空' })
  password: string;

  @ApiProperty({ description: '确认新密码' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirm: string;
}
