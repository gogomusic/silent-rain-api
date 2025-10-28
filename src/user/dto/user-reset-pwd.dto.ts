import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ChangeUserPwdDto } from './change-user-pwd.dto';

export class UserResetPwdDto extends OmitType(ChangeUserPwdDto, [
  'password',
] as const) {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail()
  email: string;
}
