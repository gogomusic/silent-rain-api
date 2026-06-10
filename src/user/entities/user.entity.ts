import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { Entity, Column } from 'typeorm';

@Entity('user')
export class User extends BasicEntity {
  @ApiProperty({ description: '用户名' })
  @Column({ length: 32, unique: true, comment: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  @Column({ length: 32, comment: '昵称' })
  nickname: string;

  @ApiProperty({ description: '密码' })
  @Column({ length: 60, select: false, comment: '密码' })
  password: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ length: 50, unique: true, comment: '邮箱' })
  email: string;

  @ApiProperty({ description: '头像' })
  @Column({ nullable: true, comment: '头像' })
  avatar: number;

  @ApiProperty({ description: '用户类型，0-普通用户，1-超级管理员' })
  @Column({
    type: 'tinyint',
    default: 0,
    comment: '用户类型，0-普通用户，1-超级管理员',
  })
  type: number;

  @ApiProperty({ description: '状态' })
  @Column({ default: 1, comment: '状态' })
  status: boolean;

  @ApiProperty({ description: '备注' })
  @Column({ nullable: true, comment: '备注' })
  remark: string;
}
