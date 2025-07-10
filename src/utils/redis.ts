import { RedisKeyPrefix } from 'src/common/enum/redis-key.enum';

/**
 * 获取 Redis 键
 * @param moduleKey Redis 键前缀
 * @param id 可选的 ID
 * @returns 完整的 Redis 键
 */
export const getRedisKey = (
  moduleKey: RedisKeyPrefix,
  id?: string | number,
) => {
  return `${moduleKey}${id ? '_' + id : ''}`;
};
