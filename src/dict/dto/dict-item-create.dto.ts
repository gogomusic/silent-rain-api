import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DictItemCreateDto {
  @ApiProperty({ description: '字典类型ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  typeId: number;

  @ApiProperty({ description: '字典标签（显示名）' })
  @IsNotEmpty({ message: '字典标签不能为空' })
  @IsString()
  label: string;

  @ApiProperty({ description: '字典值' })
  @IsNotEmpty({ message: '字典值不能为空' })
  @IsString()
  value: string;

  @ApiProperty({ description: '排序', default: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiProperty({ description: '状态', default: true })
  @IsBoolean()
  status: boolean;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
