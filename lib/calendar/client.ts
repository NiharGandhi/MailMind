import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { db } from '@/lib/db'
import { accounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { addDays } from 'date-fns'
import { getWorkingHoursInTimezone } from '@/lib/utils/date'
import type { FreeSlot, UserPreferences } from '@/types'

async function getOAuth2Client(userId: string): Promise<OAuth2Client> {
  const account = await db.query.accounts.findFirst({ where: eq(accounts.userId, userId) })
  if (!account?.access_token) throw new Error('No Google account linked')
  const oauth2 = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  oauth2.setCredentials({ access_token: account.access_token, refresh_token: account.refresh_token ?? undefined })
  return oauth2
}

export async function getCalendarClient(userId: string) {
  return google.calendar({ version: 'v3', auth: await getOAuth2Client(userId) })
}

export async function getUpcomingEvents(userId: string, daysAhead = 7) {
  const cal = await getCalendarClient(userId)
  const now = new Date()
  const res = await cal.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: addDays(now, daysAhead).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  })
  return res.data.items ?? []
}

export async function findFreeSlots(
  userId: string,
  prefs: Pick<UserPreferences, 'timezone' | 'workingHoursStart' | 'workingHoursEnd' | 'workingDays'>,
  options: { durationMinutes: number; daysAhead: number }
): Promise<FreeSlot[]> {
  const cal = await getCalendarClient(userId)
  const now = new Date()
  const end = addDays(now, options.daysAhead)

  const freebusyRes = await cal.freebusy.query({
    requestBody: { timeMin: now.toISOString(), timeMax: end.toISOString(), items: [{ id: 'primary' }] },
  })

  const busyPeriods = freebusyRes.data.calendars?.primary?.busy ?? []
  const freeSlots: FreeSlot[] = []
  const durationMs = options.durationMinutes * 60 * 1000

  for (let d = 0; d < options.daysAhead; d++) {
    const day = addDays(now, d)
    if (!prefs.workingDays.includes(day.getDay())) continue

    const { start: ws, end: we } = getWorkingHoursInTimezone(
      day, prefs.timezone, prefs.workingHoursStart, prefs.workingHoursEnd
    )

    const slots = findSlotsInWindow(ws, we, busyPeriods, durationMs)
    freeSlots.push(...slots.slice(0, 2))
    if (freeSlots.length >= 6) break
  }

  return freeSlots.slice(0, 6)
}

function findSlotsInWindow(
  windowStart: Date,
  windowEnd: Date,
  busyPeriods: Array<{ start?: string | null; end?: string | null }>,
  durationMs: number
): FreeSlot[] {
  const slots: FreeSlot[] = []
  const busy = busyPeriods
    .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }))
    .filter((b) => b.end > windowStart && b.start < windowEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  let current = windowStart
  for (const period of busy) {
    if (period.start > current && period.start.getTime() - current.getTime() >= durationMs) {
      slots.push({ start: current, end: new Date(current.getTime() + durationMs) })
    }
    if (period.end > current) current = period.end
  }
  if (windowEnd.getTime() - current.getTime() >= durationMs) {
    slots.push({ start: current, end: new Date(current.getTime() + durationMs) })
  }
  return slots
}
