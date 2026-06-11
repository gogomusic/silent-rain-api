import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';

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
}
