import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

/** 列表请求基础DTO */
export class ListBaseDto {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  current: number = 1;

  @ApiProperty({ description: '分页大小', default: 10, required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  pageSize: number = 10;
}
