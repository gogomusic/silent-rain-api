/**
 * 将字段名归一化：转小写 + 去除所有下划线
 * 用于模糊匹配大小写、下划线等变形
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/_/g, '');
}

/** 敏感字段名（原始写法，仅作可读参考），匹配时忽略大小写和下划线 */
export const SENSITIVE_FIELDS = [
  'password',
  'newPassword',
  'oldPassword',
  'confirmPassword',
  'accessToken',
  'refreshToken',
  'token',
  'secret',
  'authorization',
  'verificationCode',
  'smsCode',
];

/** 归一化后的敏感字段 Set，供快速查找 */
const SENSITIVE_SET = new Set(SENSITIVE_FIELDS.map(normalizeKey));

/** 移除 body 中的敏感字段，返回 JSON 字符串 */
export function maskSensitiveFields(
  body: unknown,
  files?: any,
  pretty?: boolean,
): string {
  if (!body) return '{}';
  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_SET.has(normalizeKey(key))) {
      masked[key] = '******';
    } else {
      masked[key] = value;
    }
  }
  masked.files = Array.isArray(files) && files.length > 0 ? files : undefined;
  return JSON.stringify(masked, null, pretty ? 2 : undefined);
}
