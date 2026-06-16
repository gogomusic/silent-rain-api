import { IsEmail, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/** 整数ID查询参数 */
export class IntIdQueryDto {
  @ApiProperty({ description: 'ID' })
  @Type(() => Number)
  @IsInt({ message: 'id必须为整数' })
  @Min(1, { message: 'ID 不能小于1' })
  id: number;
}

/** 邮箱查询参数 */
export class EmailQueryDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式错误' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}
