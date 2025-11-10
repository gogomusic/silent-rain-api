import { ApiProperty } from '@nestjs/swagger';
import { LoginType } from 'src/common/enum/common.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LoginLog {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ type: 'int', comment: '用户ID' })
  user_id: number;

  @ApiProperty({ description: '用户名' })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '用户名',
  })
  username: string;

  @ApiProperty({ description: '昵称' })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '昵称',
  })
  nickname: string;

  @ApiProperty({
    description: '登录类型 0退出系统 1登录系统',
    enum: LoginType,
  })
  @Column({ type: 'tinyint', comment: '登录类型 0退出系统 1登录系统' })
  type: LoginType;

  @ApiProperty({ description: 'IP地址' })
  @Column({ type: 'varchar', length: 100, comment: 'IP地址' })
  ip: string;

  @ApiProperty({ description: '设备' })
  @Column({ type: 'varchar', length: 50, comment: '设备' })
  device: string;

  @ApiProperty({ description: '浏览器' })
  @Column({ type: 'varchar', length: 50, comment: '浏览器' })
  browser: string;

  @ApiProperty({ description: '操作系统' })
  @Column({ type: 'varchar', length: 50, comment: '操作系统' })
  os: string;

  @ApiProperty({ description: '用户代理' })
  @Column({ type: 'varchar', comment: '用户代理' })
  user_agent: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  created_at: Date;
}
