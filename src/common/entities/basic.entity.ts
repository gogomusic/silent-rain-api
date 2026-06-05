import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { formatDate } from '../utils';
import { Transform } from 'class-transformer';
import dayjs from 'dayjs';

export class BasicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  @Transform(({ value }) => formatDate(value as dayjs.ConfigType))
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  @Transform(({ value }) => formatDate(value as dayjs.ConfigType))
  updatedAt: Date;
}
