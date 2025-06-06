/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      // @ts-ignore
      host: configService.get<string>('EMAIL_HOST'),
      port: configService.get<string>('EMAIL_PORT'),
      secure: configService.get<string>('EMAIL_SECURE'),
      auth: {
        user: configService.get<string>('EMAIL_USER'),
        pass: configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  /** 测试连接配置 */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log(`邮件服务器验证成功`);
      return true;
    } catch (error) {
      console.error('邮件服务器验证失败', error);
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
      from: this.configService.get<string>('EMAIL_USER')!,
      to: email,
      text: `【静夜聆雨】验证码：${code}，有限期为5分钟，请及时使用。如非本人操作，请忽略此邮件。`,
      subject: `【静夜聆雨】验证码`,
    };
    const result = await this.sendMail(mailOptions);
    return { ...result, code };
  }

  /** 发送邮件 */
  sendMail(mailOptions: MailOptions): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(
        mailOptions,
        (
          error,
          info: {
            envelope: Record<string, string[]>;
          },
        ) => {
          if (error) {
            reject(
              new HttpException(
                `邮件发送失败: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          } else {
            resolve({ ...info.envelope });
          }
        },
      );
    });
  }
}
