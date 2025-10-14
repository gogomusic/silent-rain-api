import { ApiProperty } from '@nestjs/swagger';
import { UserInfoDto } from './user-info.dto';

export class CurrentUserInfoDto extends UserInfoDto {
  @ApiProperty({ description: '权限' })
  permissions: number[];
}
