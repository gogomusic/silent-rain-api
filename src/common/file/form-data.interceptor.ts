import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import multer from 'multer';
import { Observable } from 'rxjs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FormDataInterceptor implements NestInterceptor {
  #DEFAULT_FILE_UPLOAD_DIR = 'uploads';
  #DEFAULT_FILE_SIZE_LIMIT_MB = 10;
  private upload: multer.Multer;
  constructor(private readonly configService: ConfigService) {
    this.upload = multer({
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const module = req.body.module as string | undefined;
          if (!module) {
            return cb(new Error('未提供上传模块'), '');
          }
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const uploadPath = path.join(
            this.configService.get<string>('FILE_UPLOAD_DIR') ||
              this.#DEFAULT_FILE_UPLOAD_DIR,
            module,
            year.toString(),
            month.toString(),
          );
          fs.mkdirSync(uploadPath, { recursive: true });
          return cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          return cb(null, `${uuidV4()}${extname(file.originalname)}`);
        },
      }),
      // 可选限制：单文件最大 10MB，可按需调整
      limits: {
        fileSize:
          (Number(this.configService.get<string>('FILE_UPLOAD_LIMIT_MB')) ||
            this.#DEFAULT_FILE_SIZE_LIMIT_MB) *
          1024 *
          1024,
      },
    });
  }

  private multerAny(req: Request, res: Response): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const handler = this.upload.any();
      void handler(req, res, (err: unknown) => {
        if (err)
          return reject(err instanceof Error ? err : new Error('文件上传失败'));
        resolve();
      });
    });
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const req: Request = ctx.getRequest();
    const res: Response = ctx.getResponse();

    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return next.handle();
    }

    try {
      await this.multerAny(req, res);
    } catch (error) {
      throw new BadRequestException((error && error.message) || '文件上传失败');
    }

    return next.handle();
  }
}
