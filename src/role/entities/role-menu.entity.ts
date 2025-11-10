import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RoleMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '角色ID' })
  role_id: number;

  @Column({ type: 'int', comment: '菜单ID' })
  menu_id: number;
}
