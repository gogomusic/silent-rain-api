import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserRole {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id', type: 'int', comment: '用户ID' })
  userId: number;

  @ApiProperty({ description: '角色ID' })
  @Column({ name: 'role_id', type: 'int', comment: '角色ID' })
  roleId: number;
}
