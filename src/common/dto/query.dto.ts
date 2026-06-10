import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class IntIdQueryDto {
  @ApiProperty({ description: 'ID' })
  @Type(() => Number)
  @IsInt({ message: 'id格式错误' })
  @IsNotEmpty({ message: 'id不能为空' })
  id: number;
}

export class EmailQueryDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式错误' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}
