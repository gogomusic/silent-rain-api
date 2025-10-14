import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '角色ID' })
  role_id: number;

  @Column({ type: 'int', comment: '权限ID' })
  permission_id: number;
}
