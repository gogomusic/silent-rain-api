import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

/** 列表请求基础DTO */
export class ListBaseDto {
  @ApiProperty({ description: '页码' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  current: number;

  @ApiProperty({ description: '分页大小' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  @IsPositive()
  pageSize: number;
}
