import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getRedisKey } from 'src/utils/redis';
import { RedisKeyPrefix } from '../enum/redis-key.enum';
import dayjs from 'dayjs';
import { RedisService } from '../redis/redis.service';
import SMTPPool from 'nodemailer/lib/smtp-pool';

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly transporter: Transporter;
  private readonly EMAIL_LIMIT_DAY: number;
  private readonly EMAIL_LIMIT_HOUR: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.EMAIL_LIMIT_DAY = Number(configService.get('EMAIL_LIMIT_DAY')) || 50;
    this.EMAIL_LIMIT_HOUR = Number(configService.get('EMAIL_LIMIT_HOUR')) || 10;
    this.transporter = createTransport({
      host: configService.get('EMAIL_HOST'),
      port: Number(configService.get('EMAIL_PORT')),
      secure: configService.get('EMAIL_SECURE') === 'true',
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASS'),
      },
    } as SMTPPool.Options);
  }

  /** 测试连接配置 */
  async testConnection() {
    const emailServerAddr = `${this.configService.get('EMAIL_HOST')}:${this.configService.get('EMAIL_PORT')}`;
    try {
      await this.transporter.verify();
      console.log(`邮件服务器验证成功(${emailServerAddr})`);
      return true;
    } catch (error) {
      console.error(`邮件服务器验证失败(${emailServerAddr})`, error);
      return false;
    }
  }

  async onModuleInit() {
    await this.testConnection();
  }

  /** 发送验证码邮件 */
  async sendRegisterCode(email: string) {
    const code = Math.random().toString().slice(-6);
    const mailOptions: MailOptions = {
      from: this.configService.get('EMAIL_USER')!,
      to: email,
      text: `验证码：${code}，有限期为5分钟，请及时使用。如非本人操作，请忽略此邮件。`,
      subject: `【静夜聆雨】验证码`,
    };
    const result = await this.sendMail(mailOptions);
    return { ...result, code };
  }

  /** 发送邮件 */
  async sendMail(mailOptions: MailOptions): Promise<Record<string, unknown>> {
    const email_limit_day_key = getRedisKey(
      RedisKeyPrefix.EMAIL_SERVICE,
      `limit_day_${dayjs().format('YYYYMMDD')}`,
    );
    const email_limit_hour_key = getRedisKey(
      RedisKeyPrefix.EMAIL_SERVICE,
      `limit_hour_${dayjs().format('HH')}`,
    );

    const [dayCount, hourCount] = await Promise.all([
      this.redisService.get(email_limit_day_key),
      this.redisService.get(email_limit_hour_key),
    ]);

    if (Number(dayCount || '0') >= this.EMAIL_LIMIT_DAY) {
      return { code: 1, message: '今日邮件服务器发送次数已达上限', data: null };
    }
    if (Number(hourCount || '0') >= this.EMAIL_LIMIT_HOUR) {
      return {
        code: 1,
        message: '邮件服务器每小时发送次数已达上限',
        data: null,
      };
    }

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(
        mailOptions,
        (error, info: { envelope: Record<string, string[]> }) => {
          if (error) {
            reject(
              new HttpException(
                `邮件发送失败: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            void (async () => {
              try {
                await Promise.all([
                  this.redisService.incr(email_limit_day_key),
                  this.redisService.incr(email_limit_hour_key),
                ]);
                await this.redisService.expire(
                  email_limit_day_key,
                  60 * 60 * 24,
                );
                await this.redisService.expire(email_limit_hour_key, 60 * 60);
                resolve({ ...info.envelope });
              } catch {
                reject(
                  new HttpException(
                    `邮件发送后更新Redis失败`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  ),
                );
              }
            })();
          }
        },
      );
    });
  }
}
