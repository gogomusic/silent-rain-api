import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async saveFileInfo(file: Partial<File>) {
    const data = await this.fileRepository.save(file);
    return {
      fileId: data.id,
      filePath: data.key,
      fileOriginalName: data.originalName,
    };
  }

  async findFileInfo(id: number) {
    return await this.fileRepository.findOne({ where: { id } });
  }
}
