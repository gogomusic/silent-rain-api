import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Get, Query, Req, UseInterceptors } from '@nestjs/common/decorators';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { AuthService } from 'src/common/auth/auth.service';
import { UserService } from './user.service';
import { LocalAuthGuard } from 'src/common/auth/local-auth.guard';
import { AllowNoToken } from 'src/common/decorators/token.decorator';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { AllowNoPermission } from 'src/common/decorators/permission.decorator';
import { UserListDto } from './dto/user-list.dto';
import { UpdateSelfDto } from './dto/update-self.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import {
  LogAction,
  LogModule,
} from 'src/common/decorators/operation.decorator';
import { ChangeUserPwdDto } from './dto/change-user-pwd.dto';
import { UserResetPwdDto } from './dto/user-reset-pwd.dto';
import { SetRolesDto } from './dto/set-roles.dto.td';
import { Menu } from 'src/menu/entities/menu.entity';
import { MenuService } from 'src/menu/menu.service';

@ApiTags('用户 /user')
@LogModule('用户')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {}

  @ApiOperation({
    summary: '登录',
  })
  @Post('login')
  @ApiGenericResponse({ model: String })
  @AllowNoToken()
  @ApiSecurity({})
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
  @ApiGenericResponse({ model: User })
  @Get('info')
  findOne(@Query('id', ParseIntPipe) id: string) {
    return this.userService.findUserAllInfo({ id: +id });
  }

  @ApiOperation({
    summary: '当前登陆用户详情',
  })
  @ApiGenericResponse({ model: User })
  @Get('current')
  @AllowNoPermission()
  findCurrent(@Req() req: { user: User }) {
    return this.userService.findUserAllInfo(req.user, true);
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
  @ApiGenericResponse({
    model: User,
    isList: true,
  })
  @Post('list')
  list(@Body() dto: UserListDto) {
    return this.userService.getUserList(dto);
  }

  @ApiOperation({
    summary: '修改个人资料',
  })
  @LogAction('修改个人资料')
  @Post('updateSelf')
  @ApiGenericResponse()
  @AllowNoPermission()
  updateSelf(@Body() data: UpdateSelfDto) {
    return this.userService.updateSelf(data);
  }

  @ApiOperation({
    summary: '修改用户状态',
  })
  @LogAction('修改用户状态')
  @Post('changeStatus')
  @ApiGenericResponse()
  changeStatus(@Body() data: ChangeStatusDto) {
    return this.userService.changeStatus(data);
  }

  @ApiOperation({
    summary: '修改密码',
  })
  @LogAction('修改密码')
  @Post('changePwd')
  @ApiGenericResponse()
  @AllowNoPermission()
  changePwd(@Req() req: { user: User }, @Body() data: ChangeUserPwdDto) {
    return this.userService.changePwd(req.user, data);
  }

  @ApiOperation({
    summary: '重置密码',
    description: '用户忘记密码时，通过用户名、邮箱、验证码重新设置密码',
  })
  @LogAction('重置密码')
  @Post('resetPwd')
  @ApiGenericResponse()
  @AllowNoToken()
  @ApiSecurity({})
  resetPwd(@Body() data: UserResetPwdDto) {
    return this.userService.resetPwd(data);
  }

  @ApiOperation({
    summary: '设置角色',
  })
  @LogAction('设置角色')
  @Post('setRoles')
  @ApiGenericResponse()
  setRoles(@Body() data: SetRolesDto) {
    return this.userService.setRoles(data);
  }

  @ApiOperation({
    summary: '获取当前用户的菜单',
  })
  @ApiGenericResponse({
    model: Menu,
    isArray: true,
  })
  @AllowNoPermission()
  @Post('menus')
  menus(@Req() req: { user: User }) {
    return this.menuService.getCurrentUserMenu(req.user.id);
  }
}
