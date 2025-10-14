import { PermissionType } from 'src/common/enum/common.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '权限名称' })
  name: string;

  @Column({ type: 'varchar', nullable: true, length: 50, comment: '权限标识' })
  code: string;

  @Column({ type: 'int', comment: '权限类型 0菜单 1按钮' })
  type: PermissionType;

  @Column({ type: 'int', comment: '父级ID', default: 0 })
  parent_id: number;
}
