import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

@Entity()
export class Role extends BasicEntity {
  @ApiProperty({ description: '角色名称' })
  @Column({ length: 32, comment: '角色名称' })
  name: string;

  @ApiProperty({ description: '备注', required: false })
  @Column({ comment: '备注', nullable: true })
  remark?: string;

  @ApiProperty({
    description: '状态',
    default: true,
  })
  @Column({ type: 'boolean', comment: '状态', default: true })
  status: boolean;

  @ApiProperty({ description: '是否内置角色', readOnly: true })
  @Exclude()
  @Column({ type: 'boolean', comment: '是否内置角色', default: false })
  builtIn: boolean;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', comment: '删除时间' })
  deletedAt?: Date;
}
