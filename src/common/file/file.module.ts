import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    MulterModule.register({
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
            'uploads',
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
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
