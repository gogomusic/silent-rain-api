import { Controller } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiTags } from '@nestjs/swagger';
import { LogModule } from 'src/common/logger/operation.decorator';

@LogModule('日志管理')
@ApiTags('日志 /log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  // @Post('list')
  // list(@Body() logDto: LogDto) {
  //   return this.logService.list(logDto);
  // }
}
