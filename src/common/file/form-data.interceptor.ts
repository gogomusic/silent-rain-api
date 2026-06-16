import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import multer, { diskStorage } from 'multer';
import { Observable } from 'rxjs';
import { extname } from 'path';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * 文件上传拦截器
 *
 * 自动处理 multipart/form-data 请求，将上传的文件保存到磁盘。
 * 需配合 @UseInterceptors(FormDataInterceptor) 使用。
 *
 * 文件存储路径: {FILE_UPLOAD_DIR}/{module}/{yyyy}/{MM}/{uuid}.{ext}
 * 请求 body 需包含 module 字段指定上传模块（如 avatar、post 等）
 */
@Injectable()
export class FormDataInterceptor implements NestInterceptor {
  private upload: multer.Multer;

  constructor(private readonly configService: ConfigService) {
    this.upload = multer({
      storage: diskStorage({
        /** 按模块/年/月 分目录存储 */
        destination: (req, _file, cb) => {
          const module = req.body.module as string | undefined;
          if (!module) {
            return cb(new Error('未提供上传模块'), '');
          }
          const date = new Date();
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const uploadPath = path.join(
            this.configService.get<string>('FILE_UPLOAD_DIR')!,
            module,
            year.toString(),
            month.toString(),
          );
          fs.mkdirSync(uploadPath, { recursive: true });
          return cb(null, uploadPath);
        },
        /** UUID 重命名，避免文件名冲突 */
        filename: (_req, file, cb) => {
          return cb(null, `${uuidV4()}${extname(String(file.originalname))}`);
        },
      }),
      limits: {
        fileSize:
          Number(this.configService.get<string>('FILE_UPLOAD_LIMIT_MB')) *
          1024 *
          1024,
      },
    });
  }

  /** 将 multer.any() 回调包装为 Promise */
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

    // 非 multipart/form-data 请求跳过处理
    const contentType = req.headers['content-type'] ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return next.handle();
    }

    // 解析文件并挂载到 req.files
    try {
      await this.multerAny(req, res);
    } catch (error) {
      throw new BadRequestException(
        (error as Error)?.message || '文件上传失败',
      );
    }

    return next.handle();
  }
}
