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
      file_id: data.id,
      file_path: data.key,
      file_original_name: data.original_name,
    };
  }
}
