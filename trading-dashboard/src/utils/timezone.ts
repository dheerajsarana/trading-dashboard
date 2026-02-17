export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)', abbr: 'IST' },
  { value: 'UTC', label: 'UTC', abbr: 'UTC' },
  { value: 'America/New_York', label: 'EST/EDT (UTC-5/-4)', abbr: 'ET' },
  { value: 'Europe/London', label: 'GMT/BST (UTC+0/+1)', abbr: 'GMT' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9)', abbr: 'JST' },
  { value: 'Asia/Dubai', label: 'GST (UTC+4)', abbr: 'GST' },
] as const;

export function getTimezoneAbbr(timezone: string): string {
  return TIMEZONE_OPTIONS.find(tz => tz.value === timezone)?.abbr || timezone;
}

export function formatDateInTimezone(
  date: Date | string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', { timeZone: timezone, ...options });
}
