import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class DictTypeCreateDto {
  @ApiProperty({ description: '字典名称' })
  @IsNotEmpty({ message: '字典名称不能为空' })
  name: string;

  @ApiProperty({ description: '字典编码（唯一标识）' })
  @IsNotEmpty({ message: '字典编码不能为空' })
  code: string;

  @ApiProperty({ description: '状态', default: true })
  @IsBoolean()
  status: boolean;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  remark?: string;
}
