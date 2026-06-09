import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BizCode } from 'src/common/constants/biz-code.enum';

export class ResponseDto<T = unknown> {
  @ApiProperty({ description: '响应状态码', example: BizCode.SUCCESS })
  @Expose()
  readonly code: BizCode;

  @ApiProperty({ description: '提示消息', example: 'success' })
  @Expose()
  readonly msg: string;

  @ApiProperty({ description: '响应数据', required: false })
  @Expose()
  readonly data?: T;

  constructor(code: BizCode, msg: string, data?: T) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }

  /** 成功响应 */
  static success<T>(data?: T, msg = 'success'): ResponseDto<T> {
    return new ResponseDto(BizCode.SUCCESS, msg, data);
  }

  /** 失败响应 */
  static fail(msg = 'fail', code = BizCode.FAIL): ResponseDto {
    return new ResponseDto(code, msg);
  }
}
