import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entity/time.entity';
import { StatusEnum } from 'src/common/enum/common.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class Role extends BasicEntity {
  @ApiProperty({ description: '角色名称' })
  @Column({ type: 'varchar', length: 50, comment: '角色名称' })
  name: string;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'varchar', comment: '备注', nullable: true })
  remark: string;

  @ApiProperty({
    description: '状态：1:启用，0:禁用',
    default: 1,
    enum: StatusEnum,
    enumName: 'RoleStatusEnum',
  })
  @Column({ type: 'tinyint', comment: '状态：1:启用，0:禁用', default: 1 })
  status: StatusEnum;
}
