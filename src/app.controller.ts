import { Controller, Get } from '@nestjs/common';
import { MailService } from './common/mail/mail.service';

@Controller()
export class AppController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  async getHello() {
    return await this.mailService.sendVerificationCode(
      'dengtz@innosilicon.com.cn',
    );
  }
}
