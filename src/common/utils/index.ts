import dayjs from 'dayjs';

export function formatDate(value: dayjs.ConfigType): string | null {
  if (value == null) return null;
  const d = dayjs(value);
  if (!d.isValid()) return null;
  return d.format('YYYY-MM-DD HH:mm:ss');
}
