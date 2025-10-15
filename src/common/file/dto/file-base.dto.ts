import { ApiProperty } from '@nestjs/swagger';

/** 文件基本详情DTO */
export class FileBaseDto {
  @ApiProperty({ description: '文件ID' })
  file_id: number;

  @ApiProperty({ description: '文件路径' })
  file_path: string;

  @ApiProperty({ description: '原始文件名' })
  file_original_name: string;
}
