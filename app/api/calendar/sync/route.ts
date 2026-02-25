import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { syncCalendar } from '@/lib/calendar/sync'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await syncCalendar(session.user.id)
  return NextResponse.json({ data: result })
}
