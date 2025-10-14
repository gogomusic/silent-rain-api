import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Get, Query, Req } from '@nestjs/common/decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { AuthService } from 'src/common/auth/auth.service';
import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { LocalAuthGuard } from 'src/common/auth/local-auth.guard';
import { AllowNoToken } from 'src/common/decorators/token-decorator';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { CurrentUserInfoDto } from './dto/current-user-info.dto';
import { AllowNoPermission } from 'src/common/decorators/permission-decorator';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('用户 /user')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: '登录',
  })
  @Post('login')
  @ApiGenericResponse('用户登录成功', String)
  @AllowNoToken()
  @UseGuards(LocalAuthGuard)
  login(
    @Body() _loginUserDto: LoginUserDto,
    @Req() req: { user: ResponseDto<User> },
  ) {
    if (req.user.success)
      return this.authService.generateAccessToken(req.user.data!);
    return req.user;
  }

  @ApiOperation({
    summary: '用户详情',
  })
  @ApiGenericResponse('用户详情', UserInfoDto)
  @Get('info')
  findOne(@Query('id') id: string) {
    return this.userService.findOne({ id: +id });
  }

  @ApiOperation({
    summary: '当前登陆用户详情',
  })
  @ApiGenericResponse('当前登陆用户详情', CurrentUserInfoDto)
  @Get('current')
  @AllowNoPermission()
  findCurrent(@Req() req: { user: User }) {
    return this.userService.findOne(req.user, true);
  }

  @ApiOperation({
    summary: '退出登录',
  })
  @ApiGenericResponse()
  @Get('logout')
  @AllowNoPermission()
  logout(@Req() req: { user: User }) {
    return this.userService.logout(req.user.id);
  }

  @ApiOperation({
    summary: '用户列表',
  })
  @ApiGenericResponse('用户列表', Array<UserInfoDto>)
  @Get('list')
  list() {
    return this.userService.findAll();
  }
}
