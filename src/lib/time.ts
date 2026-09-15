/**
 * Timezone helpers for Asia/Karachi (Pakistan Standard Time, UTC+5)
 */

export const PKT_TIMEZONE = "Asia/Karachi";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Get date parts in Asia/Karachi timezone
 */
export function getPKTParts(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PKT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);

  // Derive day of week for PKT date
  const pktDateObj = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = pktDateObj.getUTCDay();

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek,
  };
}

/**
 * Formats date as YYYY-MM-DD in Asia/Karachi
 */
export function getPKTDateString(date: Date = new Date()): string {
  const { year, month, day } = getPKTParts(date);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Get current hour (0-23) in Asia/Karachi
 */
export function getPKTHour(date: Date = new Date()): number {
  return getPKTParts(date).hour;
}

/**
 * Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) in Asia/Karachi
 */
export function getPKTDayOfWeek(date: Date = new Date()): number {
  return getPKTParts(date).dayOfWeek;
}

/**
 * Get formatted time string in Asia/Karachi (e.g. "05:30 PM PKT")
 */
export function getPKTTimeString(date: Date = new Date()): string {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PKT_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${timeFormatter.format(date)} PKT`;
}

/**
 * Generate a list of past N days (YYYY-MM-DD) in PKT leading up to today
 */
export function getPKTPastDays(count: number = 14): string[] {
  const days: string[] = [];
  const today = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    days.push(getPKTDateString(d));
  }
  
  return days;
}
