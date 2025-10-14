import { ApiProperty } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/list.req.dto';

export class UserListReqDto extends ListReqDto {
  @ApiProperty({ description: '用户名' })
  username: string;
}
