import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { StatusEnum } from 'src/common/enum/common.enum';

export class ChangeStatusDto {
  @ApiProperty({ description: 'id' })
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({
    description: '用户状态 0:停用 1:启用',
    enum: StatusEnum,
    enumName: 'UserStatusEnum',
  })
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
