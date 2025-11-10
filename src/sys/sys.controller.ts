import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SysService } from './sys.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { AllowNoToken } from 'src/common/decorators/token.decorator';
import {
  LogAction,
  LogModule,
} from 'src/common/decorators/operation.decorator';

@ApiTags('系统 /sys')
@LogModule('系统')
@Controller('sys')
export class SysController {
  constructor(
    private readonly sysService: SysService,
    private readonly userService: UserService,
  ) {}

  /** 获取注册验证码 */
  @ApiOperation({
    summary: '获取注册验证码',
    description: '注册验证码将发送至用户邮箱',
  })
  @Get('registerCode')
  @LogAction('获取注册验证码')
  @ApiGenericResponse()
  @AllowNoToken()
  @ApiSecurity({})
  registerCode(@Query('email') email: string) {
    return this.sysService.sendMailForRegister(email);
  }

  /** 获取修改密码验证码 */
  @ApiOperation({
    summary: '获取修改密码验证码',
    description: '通过邮箱获取修改密码验证码',
  })
  @Get('changePwdCode')
  @LogAction('获取修改密码验证码')
  @ApiGenericResponse()
  @AllowNoToken()
  @ApiSecurity({})
  changePwdCode(@Query('email') email: string) {
    return this.sysService.sendMailForChangePwd(email);
  }

  /** 注册 */
  @ApiOperation({
    summary: '注册',
  })
  @LogAction('注册')
  @Post('register')
  @ApiGenericResponse()
  @AllowNoToken()
  @ApiSecurity({})
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  /** 公钥接口 */
  @ApiOperation({
    summary: '公钥接口',
  })
  @Get('getPublicKey')
  @ApiGenericResponse({ model: String })
  @AllowNoToken()
  @ApiSecurity({})
  getPublicKey() {
    return this.sysService.getPublicKey();
  }
}
