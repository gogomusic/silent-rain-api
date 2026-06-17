import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class DictType extends BasicEntity {
  @ApiProperty({ description: '字典名称' })
  @Column({ length: 32, comment: '字典名称' })
  name: string;

  @ApiProperty({ description: '字典编码（唯一标识）' })
  @Column({ length: 64, unique: true, comment: '字典编码（唯一标识）' })
  code: string;

  @ApiProperty({ description: '状态', default: true })
  @Column({ type: 'boolean', comment: '状态', default: true })
  status: boolean;

  @ApiProperty({ description: '备注', required: false })
  @Column({ comment: '备注', nullable: true })
  remark?: string;
}
