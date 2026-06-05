import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IntIdQueryDto } from 'src/common/dto/query.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { User } from './entities/user.entity';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/auth/token.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() registerDto: CreateUserDto) {
    return registerDto;
  }

  @Get('info')
  findOne(@Query() { id }: IntIdQueryDto) {
    return this.usersService.findOneById(id);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _userLoginDto: UserLoginDto, @Req() req: { user: User }) {
    const { id, username } = req.user;
    return this.authService.generateAccessToken(id, username);
  }
}
