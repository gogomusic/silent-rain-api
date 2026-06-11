import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** 整数ID查询参数 */
export class IntIdQueryDto {
  @ApiProperty({ description: 'ID' })
  @IsNumberString({}, { message: 'id格式错误' })
  @IsNotEmpty({ message: 'id不能为空' })
  id: string;
}

/** 邮箱查询参数 */
export class EmailQueryDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式错误' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}
