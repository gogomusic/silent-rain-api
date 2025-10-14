import { ApiProperty } from '@nestjs/swagger';

/** 列表请求基础DTO */
export class ListReqDto {
  @ApiProperty({ description: '页码' })
  current: number;

  @ApiProperty({ description: '分页大小' })
  pageSize: number;
}
