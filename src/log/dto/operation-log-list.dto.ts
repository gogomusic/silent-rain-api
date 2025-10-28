import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ListBaseDto } from 'src/common/dto/list-base.dto';
import { OperationResultEnum } from 'src/common/enum/common.enum';

export class OperationLogListDto extends ListBaseDto {
  @ApiProperty({ description: '用户名' })
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '昵称' })
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '年份',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(2025, { message: '年份不能小于2025' })
  year?: number;

  @ApiProperty({
    description: '开始日期',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @ApiProperty({
    description: '结束日期',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

  @ApiProperty({ description: '模块' })
  @IsOptional()
  module?: string;

  @ApiProperty({ description: '操作' })
  @IsOptional()
  action?: string;

  @ApiProperty({ description: '操作结果', enum: OperationResultEnum })
  @IsOptional()
  @IsEnum(OperationResultEnum)
  @Type(() => Number)
  status?: OperationResultEnum;

  @ApiProperty({ description: 'IP' })
  @IsOptional()
  ip?: string;
}
