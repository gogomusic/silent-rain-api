import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictService } from './dict.service';
import { DictController } from './dict.controller';
import { DictSseService } from './dict-sse.service';
import { DictType } from './entities/dict-type.entity';
import { DictItem } from './entities/dict-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DictType, DictItem])],
  controllers: [DictController],
  providers: [DictService, DictSseService],
  exports: [DictService, DictSseService],
})
export class DictModule {}
