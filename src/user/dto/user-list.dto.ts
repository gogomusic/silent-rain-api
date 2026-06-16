import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ListBaseDto } from 'src/common/dto/list-base.dto';

export class UserListDto extends ListBaseDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '用户状态',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
