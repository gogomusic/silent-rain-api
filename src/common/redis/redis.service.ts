import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(@Inject('NEST_REDIS') private readonly client: RedisClientType) {}

  getClient(): RedisClientType {
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

  /** 哈希操作 - 设置字段 */
  async hSet(key: string, value: Record<string, any>): Promise<number> {
    const newValue = Object.entries(value)
      .map((item) => {
        const v = item[1];
        if (
          v instanceof Date ||
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean'
        ) {
          return [item[0], v.toString()];
        } else {
          return null;
        }
      })
      .filter((i) => i !== null)
      .flat();
    return await this.client.hSet(key, newValue);
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
