import { ApiProperty } from '@nestjs/swagger';
import { UserInfoResDto } from './user-info.res.dto';

export class CurrentUserInfoResDto extends UserInfoResDto {
  @ApiProperty({ description: '权限' })
  permissions: number[];
}
