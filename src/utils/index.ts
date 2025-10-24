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
