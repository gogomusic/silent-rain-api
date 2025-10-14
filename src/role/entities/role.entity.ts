import { BasicEntity } from 'src/common/entity/time.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Role extends BasicEntity {
  @Column({ type: 'varchar', length: 50, comment: '角色名称' })
  name: string;

  @Column({ type: 'varchar', comment: '备注', nullable: true })
  remark: string;

  @Column({ type: 'tinyint', comment: '状态：1启用，0禁用', default: 1 })
  status: number;
}
