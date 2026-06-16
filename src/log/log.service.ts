import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Repository, FindOptionsWhere, Between, Like } from 'typeorm';
import { LogDto } from './dto/log.dto';
import { ListResult, formatDate } from 'src/common/utils';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log) private readonly logRepository: Repository<Log>,
  ) {}

  createLog(dto: Log) {
    return this.logRepository.save(dto);
  }

  updateLog(id: number, dto: Partial<Log>) {
    return this.logRepository.update(id, dto);
  }

  async list(dto: LogDto) {
    const {
      current,
      pageSize,
      username,
      nickname,
      year,
      startDate,
      endDate,
      module,
      action,
      status,
      ip,
    } = dto;

    const where: FindOptionsWhere<Log> = {};

    if (username) where.username = Like(`%${username}%`);
    if (nickname) where.nickname = Like(`%${nickname}%`);
    if (module) where.module = Like(`%${module}%`);
    if (action) where.action = Like(`%${action}%`);
    if (status !== undefined) where.status = status;
    if (ip) where.ip = Like(`%${ip}%`);

    // 日期范围筛选：startDate/endDate 优先，year 仅在未指定起止日期时生效
    if (startDate || endDate || year) {
      const start =
        startDate || (year ? new Date(`${year}-01-01T00:00:00`) : undefined);
      const end =
        endDate || (year ? new Date(`${year}-12-31T23:59:59`) : undefined);
      if (start && end) {
        where.createdAt = Between(start, end);
      }
    }

    const skip = (current - 1) * pageSize;
    const [list, total] = await this.logRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    const result = list.map((item) => ({
      ...item,
      createdAt: formatDate(item.createdAt),
    }));

    return new ListResult(result, total);
  }
}
