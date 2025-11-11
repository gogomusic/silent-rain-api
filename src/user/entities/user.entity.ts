import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BasicEntity } from 'src/common/entity/time.entity';
import { StatusEnum, UserType } from 'src/common/enum/common.enum';
import { FileBaseDto } from 'src/common/file/dto/file-base.dto';

import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BasicEntity {
  @ApiProperty({ description: '用户名' })
  @Column({
    type: 'varchar',
    length: 32,
    nullable: false,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @ApiProperty({ description: '昵称' })
  @Column({
    type: 'varchar',
    length: 32,
    nullable: false,
    unique: true,
    comment: '昵称',
  })
  nickname: string;

  @ApiHideProperty()
  @Exclude()
  @Column({
    type: 'varchar',
    nullable: false,
    comment: '密码',
  })
  password: string;

  @ApiHideProperty()
  @Exclude()
  @Column({
    type: 'varchar',
    nullable: false,
    comment: '盐',
  })
  salt: string;

  @ApiProperty({
    description: '用户类型 0:超级管理员 1:普通用户',
    enum: UserType,
  })
  @Column({
    type: 'tinyint',
    comment: '用户类型 0:超级管理员 1:普通用户',
    default: 1,
  })
  user_type: UserType;

  @ApiProperty({ description: '邮箱' })
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
    comment: '邮箱',
  })
  email: string;

  @ApiProperty({
    description: '用户状态 0:停用 1:启用',
    enum: StatusEnum,
  })
  @Column({
    type: 'tinyint',
    comment: '用户状态 0:停用 1:启用',
    nullable: false,
    default: 1,
  })
  status: StatusEnum;

  @ApiProperty({ description: '头像' })
  @Column({ type: 'int', comment: '头像', nullable: true })
  avatar: number;

  @ApiProperty({ description: '描述' })
  @Column({ type: 'varchar', comment: '描述', default: '' })
  description: string;

  @ApiProperty({
    description: '角色',
    type: 'array',
    items: { type: 'number' },
    readOnly: true,
  })
  @Expose()
  roles: number[] = [];

  @ApiProperty({
    description: '头像详情',
    type: FileBaseDto,
    readOnly: true,
  })
  @Expose()
  avatar_info: FileBaseDto;

  @ApiProperty({
    description: '权限',
    type: 'array',
    items: { type: 'string' },
    readOnly: true,
  })
  @Expose()
  permissions: string[] = [];
}
