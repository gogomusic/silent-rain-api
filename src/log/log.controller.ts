import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { LogService } from './log.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { LoginLogListDto } from './dto/login-log-list.dto';
import { OperationLogListDto } from './dto/operation-log-list.dto';
import { LoginLog } from './entities/login-log.entity';
import { OperationLog } from './entities/operation-log.entity';

@ApiTags('日志 /log')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({
    summary: '登录日志列表',
  })
  @ApiGenericResponse({
    model: LoginLog,
    isList: true,
  })
  @Post('loginLogList')
  loginLogList(@Body() dto: LoginLogListDto) {
    return this.logService.loginLogList(dto);
  }

  @ApiOperation({
    summary: '操作日志列表',
  })
  @ApiGenericResponse({
    model: OperationLog,
    isList: true,
  })
  @Post('operationLogList')
  operationLogList(@Body() dto: OperationLogListDto) {
    return this.logService.operationLogList(dto);
  }
}
