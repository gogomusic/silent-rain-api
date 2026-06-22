import { ApiProperty } from '@nestjs/swagger';

export class UserLoginVo {
  @ApiProperty({ description: 'Token' })
  token: string;
}
