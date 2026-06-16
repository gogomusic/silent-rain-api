import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RoleMenu {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '角色ID' })
  @Column({ name: 'role_id', type: 'int', comment: '角色ID' })
  roleId: number;

  @ApiProperty({ description: '菜单ID' })
  @Column({ name: 'menu_id', type: 'int', comment: '菜单ID' })
  menuId: number;
}
