import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from './entities/dict-type.entity';
import { DictItem } from './entities/dict-item.entity';
import { DictTypeCreateDto } from './dto/dict-type-create.dto';
import { DictTypeUpdateDto } from './dto/dict-type-update.dto';
import { DictTypeListDto } from './dto/dict-type-list.dto';
import { DictItemCreateDto } from './dto/dict-item-create.dto';
import { DictItemUpdateDto } from './dto/dict-item-update.dto';
import { ListResult } from 'src/common/utils';
import { ResponseDto } from 'src/common/http/dto/response.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { getRedisKey } from 'src/common/utils/redis';
import { RedisKeyPrefix } from 'src/common/enums/redis-key.enum';
import { DictSseService } from './dict-sse.service';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictType)
    private readonly dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictItem)
    private readonly dictItemRepository: Repository<DictItem>,
    private readonly redisService: RedisService,
    private readonly dictSseService: DictSseService,
  ) {}

  // ======================== 字典类型 CRUD ========================

  async createType(dto: DictTypeCreateDto) {
    await this.dictTypeRepository.save(dto);
    return ResponseDto.success();
  }

  async updateType(dto: DictTypeUpdateDto) {
    const { id, ...rest } = dto;
    await this.dictTypeRepository.update(id, rest);

    // 清除缓存并通知 SSE
    const type = await this.dictTypeRepository.findOneBy({ id });
    if (type) {
      await this.clearDictCacheAndNotify(type.code);
    }
    return ResponseDto.success();
  }

  async listType(dto: DictTypeListDto) {
    const { current, pageSize } = dto;
    const [list, total] = await this.dictTypeRepository
      .createQueryBuilder('dt')
      .orderBy('dt.updatedAt', 'DESC')
      .skip((current - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return new ListResult(list, total);
  }

  async allTypes() {
    const list = await this.dictTypeRepository.find({
      where: { status: true },
      select: { id: true, name: true, code: true },
    });
    return new ListResult(list, list.length);
  }

  async deleteType(id: number) {
    // 级联检查：存在字典项时不允许删除
    const itemCount = await this.dictItemRepository.countBy({ typeId: id });
    if (itemCount > 0) {
      return ResponseDto.fail(400, '该字典类型下存在字典项，无法删除');
    }
    await this.dictTypeRepository.delete(id);
    return ResponseDto.success();
  }

  // ======================== 字典项 CRUD ========================

  async createItem(dto: DictItemCreateDto) {
    await this.dictItemRepository.save(dto);
    await this.clearDictCacheAndNotifyById(dto.typeId);
    return ResponseDto.success();
  }

  async updateItem(dto: DictItemUpdateDto) {
    const { id, ...rest } = dto;
    await this.dictItemRepository.update(id, rest);
    await this.clearDictCacheAndNotifyById(dto.typeId);
    return ResponseDto.success();
  }

  async deleteItem(id: number) {
    const item = await this.dictItemRepository.findOne({
      where: { id },
      relations: { dictType: true },
    });
    await this.dictItemRepository.delete(id);

    // 删除后通知前端
    if (item?.dictType) {
      await this.clearDictCacheAndNotify(item.dictType.code);
    }
    return ResponseDto.success();
  }

  async listItem(typeId: number) {
    const [list, total] = await this.dictItemRepository
      .createQueryBuilder('di')
      .where('di.typeId = :typeId', { typeId })
      .orderBy('di.sort', 'ASC')
      .getManyAndCount();
    return new ListResult(list, total);
  }

  // ======================== 🌟 按 code 获取字典项（Redis 缓存 + SSE 即时失效） ========================

  async getDictByCode(
    code: string,
  ): Promise<Pick<DictItem, 'id' | 'label' | 'value' | 'sort' | 'status'>[]> {
    if (!code) return [];
    const cacheKey = getRedisKey(RedisKeyPrefix.DICT, code);
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const items = await this.dictItemRepository
      .createQueryBuilder('di')
      .leftJoin('di.dictType', 'dt')
      .where('dt.code = :code', { code })
      .orderBy('di.sort', 'ASC')
      .select(['di.id', 'di.label', 'di.value', 'di.sort', 'di.status'])
      .getMany();

    // 缓存 1 小时
    await this.redisService.set(cacheKey, JSON.stringify(items), 3600);
    return items;
  }

  // ======================== 私有方法 ========================

  /** 清除 Redis 缓存，重新加载最新数据，并通过 SSE 推送给前端 */
  private async clearDictCacheAndNotify(code: string) {
    const cacheKey = getRedisKey(RedisKeyPrefix.DICT, code);
    await this.redisService.del(cacheKey);

    // 重新获取最新数据并推送
    const data = await this.getDictByCode(code);
    this.dictSseService.emit({ code, data });
  }

  /** 根据 typeId 查找 code 后清除缓存并通知 */
  private async clearDictCacheAndNotifyById(typeId: number) {
    const type = await this.dictTypeRepository.findOneBy({ id: typeId });
    if (type) {
      await this.clearDictCacheAndNotify(type.code);
    }
  }
}
