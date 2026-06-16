import { Controller, Post, Body } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogModule } from 'src/common/logger/operation.decorator';
import { LogDto } from './dto/log.dto';
import { ApiResponse } from 'src/common/swagger/api-response.decorator';
import { Log } from './entities/log.entity';

@ApiTags('日志管理 /log')
@LogModule('日志管理')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({
    summary: '日志列表',
  })
  @ApiResponse({
    model: Log,
    isList: true,
  })
  @Post('list')
  list(@Body() logDto: LogDto) {
    return this.logService.list(logDto);
  }
}
