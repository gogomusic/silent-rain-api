import { Controller, Post, Body } from '@nestjs/common';
import { LogService } from './log.service';
import { LoginLogResDto } from './dto/response/login-log.res.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGenericResponse } from 'src/common/decorators/api-generic-response.decorator';
import { LoginLogListDto } from './dto/login-log-list.dto';
import { OperationLogResDto } from './dto/response/operation-log.res.dto';
import { OperationLogListDto } from './dto/operation-log-list.dto';

@ApiTags('日志 /log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({
    summary: '登录日志列表',
  })
  @ApiGenericResponse({
    model: LoginLogResDto,
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
    model: OperationLogResDto,
    isList: true,
  })
  @Post('operationLogList')
  operationLogList(@Body() dto: OperationLogListDto) {
    return this.logService.operationLogList(dto);
  }
}
