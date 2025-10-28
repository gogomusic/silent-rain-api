import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class CreateUserDto extends LoginUserDto {
  @ApiProperty({ description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname: string;

  @ApiProperty({ description: '确认密码' })
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirm: string;

  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
