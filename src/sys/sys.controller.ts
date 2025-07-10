import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SysService } from './sys.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('系统 /sys')
@Controller('sys')
export class SysController {
  constructor(
    private readonly sysService: SysService,
    private readonly userService: UserService,
  ) {}

  /** 获取注册验证码 */
  @ApiOperation({
    summary: '获取注册验证码',
    description: '通过邮箱获取注册验证码',
  })
  @Get('registerCode')
  registerCode(@Query('email') email: string) {
    return this.sysService.sendMailForRegister(email);
  }

  /** 注册 */
  @ApiOperation({
    summary: '注册',
    description: '新用户注册',
  })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
