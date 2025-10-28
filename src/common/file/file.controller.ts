import { Controller, Post, Body, Req, UploadedFiles } from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { ApiGenericResponse } from '../decorators/api-generic-response.decorator';
import { FileBaseDto } from './dto/file-base.dto';
import { AllowNoPermission } from '../decorators/permission.decorator';
import { LogAction, LogModule } from '../decorators/operation.decorator';

@ApiTags('文件 /file')
@LogModule('文件')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({
    summary: '文件上传',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        module: {
          type: 'string',
          description: '模块',
          example: 'common',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @LogAction('上传')
  @Post('upload')
  @ApiGenericResponse({ model: FileBaseDto })
  @AllowNoPermission()
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: { user: User },
    @Body() body: { module: string },
  ) {
    if (!files || files.length === 0) {
      throw new Error('未上传文件');
    }
    const file = files[0];
    return await this.fileService.saveFileInfo({
      uuid: file.filename.split('.')[0],
      module: body.module,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      expired_time: undefined,
      username: req.user.username,
      key: '/' + file.path.replace(/\\/g, '/'),
    });
  }
}
