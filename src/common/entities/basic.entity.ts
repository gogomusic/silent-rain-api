import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { formatDate } from '../utils';
import { Transform } from 'class-transformer';
import dayjs from 'dayjs';
import { ApiProperty } from '@nestjs/swagger';

export class BasicEntity {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '创建时间', type: 'string' })
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  @Transform(({ value }) => formatDate(value as dayjs.ConfigType))
  createdAt: Date;

  @ApiProperty({ description: '更新时间', type: 'string' })
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  @Transform(({ value }) => formatDate(value as dayjs.ConfigType))
  updatedAt: Date;
}
