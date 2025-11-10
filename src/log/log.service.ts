import { Injectable } from '@nestjs/common';
import { LoginLogListDto } from './dto/login-log-list.dto';
import { OperationLogListDto } from './dto/operation-log-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginLog } from './entities/login-log.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { OperationLog } from './entities/operation-log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
  ) {}

  /** 创建登录日志 */
  createLoginLog(dto: LoginLog) {
    return this.loginLogRepository.save(dto);
  }

  /** 创建操作日志 */
  createOperationLog(dto: OperationLog) {
    return this.operationLogRepository.save(dto);
  }

  /** 更新操作日志 */
  updateOperationLog(id: number, dto: Partial<OperationLog>) {
    return this.operationLogRepository.update(id, dto);
  }

  /** 获取登录日志列表 */
  async loginLogList(dto: LoginLogListDto) {
    const qb = this.loginLogRepository.createQueryBuilder('log');

    if (dto.username) {
      const username = `%${dto.username}%`;
      qb.andWhere('log.username LIKE :username', { username });
    }

    if (dto.nickname) {
      const nickname = `%${dto.nickname}%`;
      qb.andWhere('log.nickname LIKE :nickname', { nickname });
    }

    if (dto.year) {
      const year = Number(dto.year);
      if (!Number.isNaN(year)) {
        qb.andWhere('YEAR(log.created_at) = :year', { year });
      }
    }
    if (dto.start_date && dto.end_date) {
      qb.andWhere('log.created_at BETWEEN :start AND :end', {
        start: dayjs(dto.start_date).startOf('day').toDate(),
        end: dayjs(dto.end_date).endOf('day').toDate(),
      });
    }

    const { current, pageSize } = dto;
    qb.skip((current - 1) * pageSize)
      .take(pageSize)
      .orderBy('log.created_at', 'DESC');

    return qb
      .getManyAndCount()
      .then(([list, total]) => ({ list, total, current, pageSize }));
  }

  /** 获取操作日志列表 */
  async operationLogList(dto: OperationLogListDto) {
    const qb = this.operationLogRepository.createQueryBuilder('log');

    if (dto.username) {
      const username = `%${dto.username}%`;
      qb.andWhere('log.username LIKE :username', { username });
    }

    if (dto.nickname) {
      const nickname = `%${dto.nickname}%`;
      qb.andWhere('log.nickname LIKE :nickname', { nickname });
    }

    if (dto.module) {
      const module = `%${dto.module}%`;
      qb.andWhere('log.module LIKE :module', { module });
    }

    if (dto.action) {
      const action = `%${dto.action}%`;
      qb.andWhere('log.action LIKE :action', { action });
    }

    if (dto.year) {
      const year = Number(dto.year);
      if (!Number.isNaN(year)) {
        qb.andWhere('YEAR(log.created_at) = :year', { year });
      }
    }

    if ('status' in dto && dto.status !== undefined) {
      qb.andWhere('status = :status', { status: dto.status });
    }

    if (dto.ip) {
      const ip = `%${dto.ip}%`;
      qb.andWhere('log.ip LIKE :ip', { ip });
    }

    if (dto.start_date && dto.end_date) {
      qb.andWhere('log.created_at BETWEEN :start AND :end', {
        start: dayjs(dto.start_date).startOf('day').toDate(),
        end: dayjs(dto.end_date).endOf('day').toDate(),
      });
    }

    const { current, pageSize } = dto;
    qb.skip((current - 1) * pageSize)
      .take(pageSize)
      .orderBy('log.created_at', 'DESC');

    return qb
      .getManyAndCount()
      .then(([list, total]) => ({ list, total, current, pageSize }));
  }
}
