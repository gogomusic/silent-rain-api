import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, Min } from 'class-validator';
import { ListBaseDto } from 'src/common/dto/list-base.dto';

export class LogDto extends ListBaseDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '年份',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(2026, { message: '年份不能小于2026' })
  year?: number;

  @ApiProperty({
    description: '开始日期',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    description: '结束日期',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({ description: '模块', required: false })
  @IsOptional()
  module?: string;

  @ApiProperty({ description: '操作', required: false })
  @IsOptional()
  action?: string;

  @ApiProperty({
    description: '操作结果',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ description: 'IP', required: false })
  @IsOptional()
  ip?: string;
}
