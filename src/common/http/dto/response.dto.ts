import { HttpStatus } from '@nestjs/common';
import { ResponseInterface } from './response.interface';
import { ApiProperty } from '@nestjs/swagger';

function isSuccessStatus(code: HttpStatus): boolean {
  return Number(code) >= 200 && Number(code) < 300;
}

/** 标准响应格式 */
export class ResponseDto<T = any> implements ResponseInterface<T> {
  @ApiProperty({
    enum: HttpStatus,
    enumName: 'HttpStatus',
    description: '响应状态码',
  })
  readonly code: HttpStatus;
  @ApiProperty({ description: '响应数据', required: false })
  readonly data?: T;
  @ApiProperty({ description: '响应消息' })
  readonly message: string;
  @ApiProperty({ description: '响应时间戳' })
  readonly timestamp: number;
  @ApiProperty({ description: '请求是否成功' })
  readonly success: boolean;

  constructor(code: HttpStatus, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
    this.success = isSuccessStatus(code);
  }

  /** 成功响应 */
  static success<T>(
    data?: T,
    message: string = '操作成功',
    code: HttpStatus = HttpStatus.OK,
  ): ResponseDto<T> {
    return new ResponseDto<T>(code, message, data);
  }

  /** 异常响应 */
  static error(
    message = '操作失败',
    code = HttpStatus.BAD_REQUEST,
  ): ResponseDto {
    return new ResponseDto(code, message);
  }
}
