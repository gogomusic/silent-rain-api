import { ApiProperty } from '@nestjs/swagger';

export class RsaDto {
  @ApiProperty({ description: 'RSA公钥唯一标识' })
  key_id: string;

  @ApiProperty({ description: 'RSA公钥' })
  public_key: string;
}
