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
import { Public } from 'src/auth/token.decorator';
import { ApiResponse } from 'src/common/swagger/api-response.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { ChangePwdDto } from './dto/change-pwd.dto';
import { ResetPwdDto } from './dto/reset-pwd.dto';

@ApiTags('用户 /user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: '发送注册验证码',
    description: '将注册验证码将发送至用户邮箱',
  })
  @ApiResponse()
  @Get('captcha')
  @Public()
  getCaptcha(@Query() { email }: EmailQueryDto) {
    return this.userService.sendMailForRegister(email);
  }

  @ApiOperation({
    summary: '注册',
  })
  @ApiResponse({ model: User })
  @Public()
  @Post('register')
  register(@Body() registerDto: UserRegisterDto) {
    return this.userService.create(registerDto);
  }

  @ApiOperation({
    summary: '详情',
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
  @Get('current')
  findCurrent(@Req() req: { user: User }) {
    return this.userService.findOneById(req.user.id);
  }

  @ApiOperation({
    summary: '登录',
  })
  @ApiResponse({ model: String })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Body() _userLoginDto: UserLoginDto, @Req() req: { user: User }) {
    const { id, username } = req.user;
    return this.authService.generateAccessToken(id, username);
  }

  @ApiOperation({
    summary: '退出登录',
  })
  @ApiResponse()
  @Get('logout')
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    await this.authService.logout(token);
    return ResponseDto.success();
  }

  @ApiOperation({ summary: '发送重置密码验证码' })
  @ApiResponse()
  @Public()
  @Get('resetPwdCaptcha')
  async sendResetPwdCaptcha(@Query() { email }: EmailQueryDto) {
    return this.userService.sendMailForResetPassword(email);
  }

  @ApiOperation({ summary: '重置密码' })
  @ApiResponse()
  @Public()
  @Post('resetPwd')
  async resetPassword(@Body() resetPasswordDto: ResetPwdDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: '修改密码' })
  @ApiResponse()
  @Post('changePwd')
  async changePassword(
    @Body() changePasswordDto: ChangePwdDto,
    @Req() req: { user: User },
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }
}
