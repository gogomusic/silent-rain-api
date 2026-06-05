import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class IntIdQueryDto {
  @IsNotEmpty({ message: 'id 不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id 格式错误' })
  id: number;
}
