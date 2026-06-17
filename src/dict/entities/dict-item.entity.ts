import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DictType } from './dict-type.entity';

@Entity()
export class DictItem extends BasicEntity {
  @ApiProperty({ description: '字典类型ID' })
  @Column({ name: 'type_id', type: 'int', comment: '字典类型ID' })
  typeId: number;

  @ManyToOne(() => DictType)
  @JoinColumn({ name: 'type_id' })
  dictType: DictType;

  @ApiProperty({ description: '字典标签（显示名）' })
  @Column({ length: 64, comment: '字典标签（显示名）' })
  label: string;

  @ApiProperty({ description: '字典值' })
  @Column({ length: 64, comment: '字典值' })
  value: string;

  @ApiProperty({ description: '排序', default: 0 })
  @Column({ type: 'int', comment: '排序', default: 0 })
  sort: number;

  @ApiProperty({ description: '状态', default: true })
  @Column({ type: 'boolean', comment: '状态', default: true })
  status: boolean;

  @ApiProperty({ description: '备注', required: false })
  @Column({ comment: '备注', nullable: true })
  remark?: string;
}
