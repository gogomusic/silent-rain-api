import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: false,
    unique: true,
    comment: 'uuid',
  })
  uuid: string;

  @Column({
    type: 'varchar',
    nullable: false,
    comment: '上传用户的用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: false,
    comment: '模块',
  })
  module: string;

  @Column({
    type: 'varchar',
  })
  key: string;

  @Column({
    type: 'varchar',
    comment: '原始文件名',
  })
  original_name: string;

  @Column({
    type: 'varchar',
    length: 64,
  })
  mime_type: string;

  @Column({
    type: 'bigint',
  })
  size: number;

  @CreateDateColumn({ type: 'timestamp', comment: '上传时间' })
  create_time: Date;

  @Column({ type: 'timestamp', comment: '过期时间', default: null })
  expired_time: Date;
}
