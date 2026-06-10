import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { type ErrorCode, ErrorShowType } from './response.enum';
import { HttpStatus } from '@nestjs/common';

interface ResponseStructure<T = unknown> {
  success: boolean;
  data?: T;
  errorCode?: ErrorCode;
  errorMessage?: string | string[];
  showType?: ErrorShowType;
}

export class ResponseDto<T = unknown> implements ResponseStructure<T> {
  @ApiProperty({ description: '响应状态', example: true })
  @Expose()
  readonly success: boolean;

  @ApiProperty({ description: '响应数据', required: false })
  @Expose()
  readonly data?: T;

  @ApiProperty({ description: '错误码', type: Number })
  @Expose()
  readonly errorCode?: ErrorCode;

  @ApiProperty({
    description: '错误消息',
    oneOf: [
      { type: 'string' },
      {
        type: 'array',
        items: { type: 'string' },
      },
    ],
  })
  @Expose()
  readonly errorMessage?: string | string[];

  @ApiProperty({
    description: '错误消息展示方式',
    enum: ErrorShowType,
    enumName: 'ErrorShowType',
  })
  @Expose()
  readonly showType?: ErrorShowType;

  constructor(
    success: boolean,
    data?: T,
    errorCode?: ErrorCode,
    errorMessage?: string | string[],
    showType?: ErrorShowType,
  ) {
    this.success = success;
    this.data = data;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.showType = showType;
  }

  /** 成功响应 */
  static success<T>(data?: T): ResponseDto<T> {
    return new ResponseDto(true, data);
  }

  /** 失败响应 */
  static fail(
    errorCode: ErrorCode = HttpStatus.BAD_REQUEST,
    errorMessage?: string | string[],
    showType: ErrorShowType = ErrorShowType.ERROR_MESSAGE,
  ): ResponseDto {
    return new ResponseDto(false, null, errorCode, errorMessage, showType);
  }
}
