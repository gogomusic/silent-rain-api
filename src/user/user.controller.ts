import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { EmailQueryDto, IntIdQueryDto } from 'src/common/dto/query.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { User } from './entities/user.entity';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { AllowNoPermission, Public } from 'src/auth/token.decorator';
import { ApiResponse } from 'src/common/swagger/api-response.decorator';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { UserChangePwdDto } from './dto/user-change-pwd.dto';
import { UserResetPwdDto } from './dto/user-reset-pwd.dto';
import { LogModule, LogAction } from 'src/common/logger/operation.decorator';
import { MenuService } from 'src/menu/menu.service';
import { UserSetRolesDto } from './dto/user-set-roles.dto';
import { Menu } from 'src/menu/entities/menu.entity';
import { UserUpdateSelfDto } from './dto/user-update-self.dto';
import { UserListDto } from './dto/user-list.dto';
import { UserLoginVo } from './vo/user-login.vo';

@LogModule('用户管理')
@ApiTags('用户管理 /user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly menuService: MenuService,
  ) {}

  @ApiOperation({
    summary: '发送注册验证码',
    description: '将注册验证码将发送至用户邮箱',
  })
  @ApiSecurity({})
  @LogAction('发送注册验证码')
  @ApiResponse()
  @Get('captcha')
  @Public()
  getCaptcha(@Query() { email }: EmailQueryDto) {
    return this.userService.sendMailForRegister(email);
  }

  @ApiOperation({
    summary: '用户注册',
  })
  @ApiSecurity({})
  @LogAction('用户注册')
  @ApiResponse({ model: User })
  @Public()
  @Post('register')
  register(@Body() registerDto: UserRegisterDto) {
    return this.userService.create(registerDto);
  }

  @ApiOperation({
    summary: '查询用户详情',
  })
  @ApiResponse({ model: User })
  @Get('info')
  findOne(@Query() { id }: IntIdQueryDto) {
    return this.userService.findOneById(id);
  }

  @ApiOperation({
    summary: '获取当前用户信息',
  })
  @ApiResponse({ model: User })
  @AllowNoPermission()
  @Get('current')
  findCurrent(@Req() req: { user: User }) {
    return this.userService.findOneById(req.user.id, true);
  }

  @ApiOperation({
    summary: '登录',
  })
  @ApiSecurity({})
  @ApiResponse({ model: UserLoginVo })
  @LogAction('用户登录')
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _userLoginDto: UserLoginDto, @Req() req: { user: User }) {
    const { id, username } = req.user;
    return { token: this.authService.generateAccessToken(id, username) };
  }

  @ApiOperation({
    summary: '退出登录',
  })
  @LogAction('退出登录')
  @ApiResponse()
  @Get('logout')
  @AllowNoPermission()
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    await this.authService.logout(token);
    return ResponseDto.success();
  }

  @ApiOperation({ summary: '发送重置密码验证码' })
  @LogAction('发送重置密码验证码')
  @ApiResponse()
  @Public()
  @Get('resetPwdCaptcha')
  async sendResetPwdCaptcha(@Query() { email }: EmailQueryDto) {
    return this.userService.sendMailForResetPassword(email);
  }

  @ApiOperation({ summary: '重置密码' })
  @ApiSecurity({})
  @LogAction('重置密码')
  @ApiResponse()
  @Public()
  @Post('resetPwd')
  async resetPassword(@Body() resetPasswordDto: UserResetPwdDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: '修改密码' })
  @LogAction('修改密码')
  @ApiResponse()
  @Post('changePwd')
  async changePassword(
    @Body() changePasswordDto: UserChangePwdDto,
    @Req() req: { user: User },
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }

  @ApiOperation({
    summary: '修改个人资料',
  })
  @LogAction('修改个人资料')
  @ApiResponse()
  @AllowNoPermission()
  @Post('updateSelf')
  updateSelf(@Body() dto: UserUpdateSelfDto) {
    return this.userService.updateSelf(dto);
  }

  @ApiOperation({
    summary: '设置角色',
  })
  @LogAction('设置角色')
  @ApiResponse()
  @Post('setRoles')
  setRoles(@Body() dto: UserSetRolesDto) {
    return this.userService.setRoles(dto);
  }

  @ApiOperation({
    summary: '获取当前用户的菜单',
  })
  @ApiResponse({
    model: Menu,
    isArray: true,
  })
  @AllowNoPermission()
  @Post('menus')
  menus(@Req() req: { user: User }) {
    return this.menuService.getCurrentUserMenu(req.user.id, req.user.type);
  }

  @ApiOperation({
    summary: '用户列表',
  })
  @ApiResponse({
    model: User,
    isList: true,
  })
  @Post('list')
  list(@Body() dto: UserListDto) {
    return this.userService.getUserList(dto);
  }
}
