import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getCalendarEventsAction } from '@/actions/calendar'
import { CalendarClient } from './CalendarClient'
import type { CalendarEvent } from '@/types'

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const events = (await getCalendarEventsAction()) as CalendarEvent[]

  return <CalendarClient events={events} />
}
