import { ApiProperty } from '@nestjs/swagger';

/** 文件基本详情DTO */
export class FileBaseDto {
  @ApiProperty({ description: '文件ID' })
  fileId: number;

  @ApiProperty({ description: '文件路径' })
  filePath: string;

  @ApiProperty({ description: '原始文件名' })
  fileOriginalName: string;
}
