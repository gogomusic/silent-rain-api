import { Controller, Get, Query } from '@nestjs/common';
import { SysService } from './sys.service';

@Controller('sys')
export class SysController {
  constructor(private readonly sysService: SysService) {}

  @Get('registerCode')
  registerCode(@Query('email') email: string) {
    return this.sysService.sendMailForRegister(email);
  }
}
