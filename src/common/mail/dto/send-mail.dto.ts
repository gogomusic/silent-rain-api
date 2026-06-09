import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({ description: '收件人邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '收件人邮箱不能为空' })
  to: string;

  @ApiProperty({ description: '邮件主题' })
  @IsString()
  @IsNotEmpty({ message: '邮件主题不能为空' })
  subject: string;

  @ApiProperty({ description: '模板名称', required: false })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({ description: '模板变量', required: false })
  @IsOptional()
  context?: Record<string, unknown>;
}
