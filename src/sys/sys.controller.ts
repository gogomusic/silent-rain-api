import { Controller, Get, Query } from '@nestjs/common';
import { SysService } from './sys.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('系统 /sys')
@Controller('sys')
export class SysController {
  constructor(private readonly sysService: SysService) {}

  /** 获取注册验证码 */
  @ApiOperation({
    summary: '获取注册验证码',
    description: '通过邮箱获取注册验证码',
  })
  @Get('registerCode')
  registerCode(@Query('email') email: string) {
    return this.sysService.sendMailForRegister(email);
  }
}
