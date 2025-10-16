import { BasicEntity } from 'src/common/entity/time.entity';
import { StatusEnum, UserType } from 'src/common/enum/common.enum';

import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BasicEntity {
  @Column({
    type: 'varchar',
    length: 32,
    nullable: false,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: false,
    unique: true,
    comment: '昵称',
  })
  nickname: string;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '密码',
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '盐',
  })
  salt: string;

  @Column({
    type: 'tinyint',
    comment: '用户类型 0超级管理员 1普通用户',
    default: 1,
  })
  user_type: UserType;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
    comment: '邮箱',
  })
  email: string;

  @Column({
    type: 'tinyint',
    comment: '用户状态 0停用 1启用',
    nullable: false,
    default: 1,
  })
  status: StatusEnum;

  @Column({ type: 'varchar', comment: '头像', default: '' })
  avatar: number;

  @Column({ type: 'varchar', comment: '描述', default: '' })
  description: string;
}
