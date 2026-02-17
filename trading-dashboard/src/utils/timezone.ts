export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'EST/EDT (UTC-5/-4)' },
  { value: 'Europe/London', label: 'GMT/BST (UTC+0/+1)' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9)' },
  { value: 'Asia/Dubai', label: 'GST (UTC+4)' },
] as const;

export function formatDateInTimezone(
  date: Date | string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', { timeZone: timezone, ...options });
}
