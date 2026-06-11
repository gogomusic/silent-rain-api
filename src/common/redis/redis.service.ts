import { Inject, Injectable } from '@nestjs/common';
import { type RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constant';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType) {}

  getClient() {
    return this.client;
  }

  /** 字符串操作 - 获取键对应的值 */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /** 字符串操作 - 设置键值对 */
  async set(
    key: string,
    value: string | number,
    ttl?: number,
  ): Promise<string | null> {
    if (ttl) {
      return await this.client.setEx(key, ttl, value.toString());
    } else {
      return await this.client.set(key, value);
    }
  }

  /** 哈希操作 - 获取哈希所有字段和值 */
  async hGetAll(key: string): Promise<Record<string, string> | null> {
    if (!key) return null;
    return await this.client.hGetAll(key);
  }

  /** 哈希操作 - 设置哈希字段（对象形式） */
  async hSet(key: string, value: Record<string, any>): Promise<number> {
    const record: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) {
      if (
        v instanceof Date ||
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean'
      ) {
        record[k] = v.toString();
      }
    }
    return await this.client.hSet(key, record);
  }

  /** 删除字段 */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /** 自增操作 */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /** 设置过期时间 */
  async expire(key: string, seconds: number) {
    return await this.client.expire(key, seconds);
  }
}
