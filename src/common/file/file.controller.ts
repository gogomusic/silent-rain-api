import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ResponseDto } from '../http/dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { ApiGenericResponse } from '../decorators/api-generic-response.decorator';
import { FileBaseDto } from './dto/file-base.dto';
import { AllowNoPermission } from '../decorators/permission-decorator';

@ApiTags('文件 /file')
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
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiGenericResponse({ model: FileBaseDto })
  @AllowNoPermission()
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: User },
    @Body() body: { module: string },
  ) {
    const data = await this.fileService.saveFileInfo({
      uuid: file.filename.split('.')[0],
      module: body.module,
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      expired_time: undefined,
      username: req.user.username,
      key: '/' + file.path.replace(/\\/g, '/'),
    });
    return ResponseDto.success({
      file_id: data.id,
      file_path: data.key,
      file_original_name: data.original_name,
    });
  }
}
