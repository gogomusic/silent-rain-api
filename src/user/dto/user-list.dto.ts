import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListBaseDto } from 'src/common/dto/list-base.dto';
import { StatusEnum } from 'src/common/enum/common.enum';

export class UserListDto extends ListBaseDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '用户状态 0停用 1启用',
    enum: StatusEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}
