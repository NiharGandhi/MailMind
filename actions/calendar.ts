'use server'

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { calendarEvents } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function getCalendarEventsAction(from?: Date, to?: Date) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const start = from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)   // 7 days ago
  const end   = to   ?? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)  // 60 days ahead

  return db.query.calendarEvents.findMany({
    where: and(
      eq(calendarEvents.userId, session.user.id),
      gte(calendarEvents.startTime, start),
      lte(calendarEvents.startTime, end)
    ),
    orderBy: [desc(calendarEvents.startTime)],
  })
}
