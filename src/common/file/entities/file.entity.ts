import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class File {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '文件UUID标识' })
  @Column({ length: 36, unique: true, comment: '文件UUID标识' })
  uuid: string;

  @ApiProperty({ description: '上传用户的用户名' })
  @Column({ comment: '上传用户的用户名' })
  username: string;

  @ApiProperty({ description: '所属模块' })
  @Column({ length: 32, comment: '所属模块' })
  module: string;

  @ApiProperty({ description: '文件访问路径' })
  @Column({ comment: '文件访问路径' })
  key: string;

  @ApiProperty({ description: '原始文件名' })
  @Column({ name: 'original_name', comment: '原始文件名' })
  originalName: string;

  @ApiProperty({ description: '文件MIME类型' })
  @Column({ name: 'mime_type', length: 64, comment: '文件MIME类型' })
  mimeType: string;

  @ApiProperty({ description: '文件大小（字节）' })
  @Column({ type: 'bigint', comment: '文件大小（字节）' })
  size: number;

  @ApiProperty({ description: '上传时间' })
  @CreateDateColumn({ name: 'created_at', comment: '上传时间' })
  createdAt: Date;

  @ApiProperty({ description: '过期时间（过期后自动清理）', nullable: true })
  @Column({
    name: 'expired_time',
    type: 'timestamp',
    comment: '过期时间（过期后自动清理）',
    default: null,
    nullable: true,
  })
  expiredTime: Date | null;
}
