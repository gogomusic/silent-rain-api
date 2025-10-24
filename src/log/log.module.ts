import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLog } from './entities/login-log.entity';
import { OperationLog } from './entities/operation-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLog, OperationLog])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
