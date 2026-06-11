import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserLoginDto } from './user-login.dto';

export class UserRegisterDto extends UserLoginDto {
  @ApiProperty({ description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname: string;

  @ApiProperty({ description: '确认密码' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmPassword: string;

  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
