import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  password: string;

  @IsEmail()
  email: string;
}
