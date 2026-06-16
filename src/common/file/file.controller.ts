import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { LogAction, LogModule } from '../logger/operation.decorator';
import { ApiResponse } from '../swagger/api-response.decorator';
import { FileBaseDto } from './dto/file-base.dto';
import { AllowNoPermission } from 'src/auth/token.decorator';
import { FormDataInterceptor } from './form-data.interceptor';
import { extname } from 'path';

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
  @UseInterceptors(FormDataInterceptor)
  @Post('upload')
  @ApiResponse({ model: FileBaseDto })
  @AllowNoPermission()
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: { user: User },
    @Body() body: { module: string },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('未上传文件');
    }

    const file = files[0];
    // filename 格式: {uuid}.{ext}，取文件名（不含扩展名）作为 UUID
    const uuid = String(file.filename).replace(
      extname(String(file.filename)),
      '',
    );

    return this.fileService.saveFileInfo({
      uuid,
      module: body.module,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      username: req.user.username,
      // 将文件路径转换为 URL 路径（反斜杠 → 正斜杠）
      key: '/' + file.path.replace(/\\/g, '/'),
    });
  }
}
