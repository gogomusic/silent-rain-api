import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import Redis from 'ioredis';
import dayjs from 'dayjs';
import { REDIS_CLIENT } from '../redis/redis.module';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private copyRight() {
    const currentYear = dayjs().year();
    const y = currentYear > 2026 ? `-${currentYear}` : '';
    return `© 2026${y} 静夜聆雨. All rights reserved.`;
  }

  /**
   * 发送验证码邮件
   */
  async sendVerificationCode(to: string, code: string): Promise<void> {
    await this.checkRateLimit();
    try {
      await this.mailerService.sendMail({
        to,
        subject: '【静夜聆雨】邮箱验证码',
        template: 'verification-code',
        context: { code, copyRight: this.copyRight() },
      });
      await this.incrementRateCounter();
    } catch (_error) {
      throw new HttpException('验证码邮件发送失败', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcome(to: string, username: string): Promise<void> {
    await this.checkRateLimit();
    try {
      await this.mailerService.sendMail({
        to,
        subject: '【静夜聆雨】欢迎注册',
        template: 'welcome',
        context: { username, copyRight: this.copyRight() },
      });
      await this.incrementRateCounter();
    } catch (_error) {
      throw new HttpException('欢迎邮件发送失败', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 通用邮件发送
   */
  async sendMail(options: SendMailDto): Promise<void> {
    await this.checkRateLimit();
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
      await this.incrementRateCounter();
    } catch (_error) {
      throw new HttpException('邮件发送失败', HttpStatus.BAD_REQUEST);
    }
  }

  // ---------- 频率限制 ----------

  private async checkRateLimit(): Promise<void> {
    const limitDay = this.configService.get<number>('EMAIL_LIMIT_DAY') ?? 50;
    const limitHour = this.configService.get<number>('EMAIL_LIMIT_HOUR') ?? 10;

    const hourKey = `email:limit:hour:${dayjs().format('YYYY-MM-DD-HH')}`;
    const dayKey = `email:limit:day:${dayjs().format('YYYY-MM-DD')}`;

    const [hourCount, dayCount] = await Promise.all([
      this.redis.get(hourKey),
      this.redis.get(dayKey),
    ]);

    if (Number(hourCount) >= limitHour) {
      throw new HttpException(
        '邮件服务器每小时发送次数已达上限',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (Number(dayCount) >= limitDay) {
      throw new HttpException(
        '今日邮件服务器发送次数已达上限',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async incrementRateCounter(): Promise<void> {
    const hourKey = `email:limit:hour:${dayjs().format('YYYY-MM-DD-HH')}`;
    const dayKey = `email:limit:day:${dayjs().format('YYYY-MM-DD')}`;

    await Promise.all([
      this.redis.multi().incr(hourKey).expire(hourKey, 3600).exec(),
      this.redis.multi().incr(dayKey).expire(dayKey, 86400).exec(),
    ]);
  }
}
