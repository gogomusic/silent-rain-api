import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { StatusEnum } from 'src/common/enum/common.enum';

export class ChangeStatusDto {
  @ApiProperty({ description: 'id' })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: '用户状态 0停用 1启用',
    enum: StatusEnum,
    enumName: 'UserStatusEnum',
  })
  @IsNotEmpty()
  status: StatusEnum;
}
