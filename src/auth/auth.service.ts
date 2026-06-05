import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOneByUsernameWithPwd(username);
    if (user?.password === password) {
      delete (user as any).password;
      return user;
    }
    return null;
  }

  /** 生成Token */
  generateAccessToken(id: number, username: string) {
    const payload = { username, sub: id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
