import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export function formatEmailDate(date: Date): string {
  if (isToday(date)) return format(date, 'h:mm a')
  if (isYesterday(date)) return 'Yesterday'
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return format(date, 'EEE')
  if (date.getFullYear() === new Date().getFullYear()) return format(date, 'MMM d')
  return format(date, 'MM/dd/yy')
}

export function formatFullDate(date: Date, timezone = 'UTC'): string {
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, "EEEE, MMMM d, yyyy 'at' h:mm a zzz")
}

export function toUTC(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone)
}

export function toUserTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone)
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

export function parseISOSafe(dateString: string): Date | null {
  try {
    return parseISO(dateString)
  } catch {
    return null
  }
}

export function getWorkingHoursInTimezone(
  date: Date,
  timezone: string,
  startHour: number,
  endHour: number
): { start: Date; end: Date } {
  const zonedDate = toZonedTime(date, timezone)
  const dateStr = format(zonedDate, 'yyyy-MM-dd')
  return {
    start: fromZonedTime(new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`), timezone),
    end: fromZonedTime(new Date(`${dateStr}T${String(endHour).padStart(2, '0')}:00:00`), timezone),
  }
}
