import { ApiProperty } from '@nestjs/swagger';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { UserType } from 'src/common/enums/common.enum';
import { Exclude, Expose } from 'class-transformer';
import { Entity, Column } from 'typeorm';
import { FileBaseDto } from 'src/common/file/dto/file-base.dto';

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

  @ApiProperty({
    description: '用户类型，0-超级管理员，1-普通用户',
    default: UserType.NORMAL_USER,
  })
  @Column({
    type: 'enum',
    enum: UserType,
    enumName: 'UserType',
    default: UserType.NORMAL_USER,
    comment: '用户类型，0-超级管理员，1-普通用户',
  })
  @Exclude()
  type: UserType;

  @ApiProperty({ description: '状态' })
  @Column({
    type: 'boolean',
    default: true,
    comment: '状态',
  })
  status: boolean;

  @ApiProperty({ description: '描述' })
  @Column({ comment: '描述', nullable: true })
  description?: string;

  @ApiProperty({ description: '上次登录时间' })
  @Column({
    type: 'datetime',
    nullable: true,
    comment: '上次登录时间',
    name: 'last_login_at',
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: '角色',
    type: [Number],
    readOnly: true,
    default: [],
  })
  @Expose()
  roles: number[];

  @ApiProperty({
    description: '头像详情',
    type: FileBaseDto,
    readOnly: true,
    nullable: true,
  })
  @Expose()
  avatarInfo: FileBaseDto | null;

  @ApiProperty({
    description: '权限',
    type: [Number],
    readOnly: true,
    default: [],
  })
  @Expose()
  permissions: number[];
}
