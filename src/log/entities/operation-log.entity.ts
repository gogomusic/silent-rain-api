import { OperationResultEnum } from 'src/common/enum/common.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID', nullable: true })
  user_id: number;

  @Column({
    type: 'varchar',
    length: 32,
    comment: '用户名',
    nullable: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 32,
    comment: '昵称',
    nullable: true,
  })
  nickname: string;

  @Column({
    type: 'varchar',
    length: 32,
    comment: '模块',
  })
  module: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作',
  })
  action: string;

  @Column({
    type: 'varchar',
    length: 5,
    comment: '请求方式',
  })
  method: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '请求接口',
  })
  url: string;

  @Column({
    type: 'json',
    comment: '请求参数',
    nullable: true,
  })
  params?: string;

  @Column({
    type: 'tinyint',
    comment: '操作结果',
  })
  status: OperationResultEnum;

  @Column({
    type: 'int',
    comment: '响应时间（ms）',
    nullable: true,
  })
  duration?: number;

  @Column({
    type: 'varchar',
    comment: '异常信息',
    nullable: true,
  })
  fail_result?: string;

  @Column({ type: 'varchar', length: 100, comment: 'IP地址' })
  ip: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '设备',
    nullable: true,
  })
  device?: string;

  @Column({ type: 'varchar', length: 50, comment: '浏览器', nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 50, comment: '操作系统', nullable: true })
  os?: string;

  @Column({ type: 'varchar', comment: '用户代理', nullable: true })
  user_agent?: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  create_time: Date;
}
