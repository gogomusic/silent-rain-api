import { LoginType } from 'src/common/enum/common.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LoginLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  user_id: number;

  @Column({
    type: 'varchar',
    length: 32,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 32,
    comment: '昵称',
  })
  nickname: string;

  @Column({ type: 'tinyint', comment: '登录类型 0退出系统 1登录系统' })
  type: LoginType;

  @Column({ type: 'varchar', length: 100, comment: 'IP地址' })
  ip: string;

  @Column({ type: 'varchar', length: 50, comment: '设备' })
  device: string;

  @Column({ type: 'varchar', length: 50, comment: '浏览器' })
  browser: string;

  @Column({ type: 'varchar', length: 50, comment: '操作系统' })
  os: string;

  @Column({ type: 'varchar', comment: '用户代理' })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  create_time: Date;
}
