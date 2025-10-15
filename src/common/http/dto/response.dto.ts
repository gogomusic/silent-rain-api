import { HttpStatus } from '@nestjs/common';
import { ResponseInterface } from './response.interface';
import { ApiProperty } from '@nestjs/swagger';

function isSuccessStatus(code: number | string): boolean {
  return Number(code) >= 200 && Number(code) < 300;
}

/** 标准响应格式 */
export class ResponseDto<T = any> implements ResponseInterface<T> {
  @ApiProperty({
    type: 'number',
    description: '响应状态码',
  })
  readonly code: HttpStatus;
  @ApiProperty({ description: '响应数据', required: false })
  readonly data?: T;
  @ApiProperty({ description: '响应消息' })
  readonly msg: string;
  @ApiProperty({ description: '请求是否成功' })
  readonly success: boolean;

  constructor(code: number, msg: string, data?: T) {
    this.code = code;
    this.msg = msg;
    this.data = data;
    this.success = isSuccessStatus(code);
  }

  /** 成功响应 */
  static success<T>(
    data?: T,
    msg: string = 'success',
    code: HttpStatus = HttpStatus.OK,
  ): ResponseDto<T> {
    return new ResponseDto<T>(code, msg, data);
  }

  /** 异常响应 */
  static error(msg = '操作失败', code = HttpStatus.BAD_REQUEST): ResponseDto {
    return new ResponseDto(code, msg);
  }
}
