import { db } from '@/lib/db'
import { calendarEvents, syncState } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUpcomingEvents } from './client'

export async function syncCalendar(userId: string): Promise<{ eventsProcessed: number; error?: string }> {
  let eventsProcessed = 0
  try {
    const events = await getUpcomingEvents(userId, 30)
    for (const event of events) {
      if (!event.id) continue
      const startTime = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : event.start?.date ? new Date(event.start.date + 'T00:00:00Z') : null
      const endTime = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : event.end?.date ? new Date(event.end.date + 'T00:00:00Z') : null
      if (!startTime || !endTime) continue

      const attendees = (event.attendees ?? []).map((a) => ({
        email: a.email ?? '',
        name: a.displayName ?? undefined,
        responseStatus: a.responseStatus as 'accepted' | 'declined' | 'tentative' | 'needsAction' | undefined,
      }))

      const existing = await db.query.calendarEvents.findFirst({
        where: and(eq(calendarEvents.userId, userId), eq(calendarEvents.googleEventId, event.id)),
      })

      const values = {
        title: event.summary ?? 'Untitled',
        description: event.description ?? null,
        startTime,
        endTime,
        location: event.location ?? null,
        attendees,
        isAllDay: !!event.start?.date,
      }

      if (existing) {
        await db.update(calendarEvents).set({ ...values, updatedAt: new Date() }).where(eq(calendarEvents.id, existing.id))
      } else {
        await db.insert(calendarEvents).values({ userId, googleEventId: event.id, ...values })
      }
      eventsProcessed++
    }

    await db.insert(syncState).values({ userId, lastCalendarSync: new Date(), syncStatus: 'idle' }).onConflictDoUpdate({
      target: syncState.userId,
      set: { lastCalendarSync: new Date(), updatedAt: new Date() },
    })
  } catch (error) {
    return { eventsProcessed, error: String(error) }
  }
  return { eventsProcessed }
}

export async function getUserCalendarEvents(userId: string, daysAhead = 7) {
  const { gte, lte } = await import('drizzle-orm')
  const now = new Date()
  const end = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  return db.query.calendarEvents.findMany({
    where: and(eq(calendarEvents.userId, userId), gte(calendarEvents.startTime, now), lte(calendarEvents.startTime, end)),
    orderBy: (t, { asc }) => [asc(t.startTime)],
  })
}
