import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Log {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id', type: 'int', comment: '用户ID', nullable: true })
  userId: number;

  @ApiProperty({ description: '用户名', nullable: true })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '用户名',
    nullable: true,
  })
  username: string;

  @ApiProperty({ description: '昵称', nullable: true })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '昵称',
    nullable: true,
  })
  nickname: string;

  @ApiProperty({ description: '模块' })
  @Column({
    type: 'varchar',
    length: 32,
    comment: '模块',
  })
  module: string;

  @ApiProperty({ description: '操作' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作',
  })
  action: string;

  @ApiProperty({ description: '请求方式' })
  @Column({
    type: 'varchar',
    length: 6,
    comment: '请求方式',
  })
  method: string;

  @ApiProperty({ description: '请求接口' })
  @Column({
    type: 'varchar',
    comment: '请求接口',
  })
  url: string;

  @ApiProperty({ description: '请求参数', nullable: true })
  @Column({
    type: 'text',
    comment: '请求参数',
    nullable: true,
  })
  params?: string;

  @ApiProperty({ description: '操作结果' })
  @Column({
    type: 'boolean',
    comment: '操作结果',
    nullable: true,
  })
  status: boolean;

  @ApiProperty({ description: '响应时间（ms）' })
  @Column({
    type: 'int',
    comment: '响应时间（ms）',
    nullable: true,
  })
  duration?: number;

  @ApiProperty({ description: '异常信息', nullable: true })
  @Column({
    name: 'error_message',
    type: 'varchar',
    comment: '异常信息',
    nullable: true,
  })
  errorMessage?: string;

  @ApiProperty({ description: 'IP地址' })
  @Column({ type: 'varchar', length: 100, comment: 'IP地址' })
  ip: string;

  @ApiProperty({ description: '设备' })
  @Column({
    type: 'varchar',
    length: 50,
    comment: '设备',
    nullable: true,
  })
  device?: string;

  @ApiProperty({ description: '浏览器' })
  @Column({ type: 'varchar', length: 50, comment: '浏览器', nullable: true })
  browser?: string;

  @ApiProperty({ description: '操作系统' })
  @Column({ type: 'varchar', length: 50, comment: '操作系统', nullable: true })
  os?: string;

  @ApiProperty({ description: '用户代理' })
  @Column({
    name: 'user_agent',
    type: 'varchar',
    comment: '用户代理',
    nullable: true,
  })
  userAgent?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: '创建时间',
  })
  createdAt: Date;
}
