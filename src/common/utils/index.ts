import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param value - 日期值
 * @returns 格式化后的日期字符串 'YYYY-MM-DD HH:mm:ss'，如果输入无效则返回 null
 */
export function formatDate(value: dayjs.ConfigType): string | null {
  if (value == null) return null;
  const d = dayjs(value);
  if (!d.isValid()) return null;
  return d.format('YYYY-MM-DD HH:mm:ss');
}

/** 列表结果封装 */
export class ListResult<T> {
  constructor(
    public list: T[] = [],
    public total = 0,
  ) {}
}

/** IP规范化 */
export function normalizeIp(addr?: string): string | undefined {
  if (!addr) return undefined;
  let ip = addr.trim();

  // 去掉方括号 [::1]
  if (ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1);
  }

  // Node 的 remoteAddress 可能带 zone id（%）
  // 去掉 zone id（例如 fe80::1%eth0）
  const pct = ip.indexOf('%');
  if (pct !== -1) ip = ip.slice(0, pct);

  // 匹配 IPv4-mapped IPv6 (::ffff:192.168.0.1)
  const m = ip.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (m) return m[1];

  // IPv6 回环 -> IPv4 回环（按需要可去掉）
  if (ip === '::1') return '127.0.0.1';

  return ip;
}
