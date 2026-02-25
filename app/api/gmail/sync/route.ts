import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { fullSync, incrementalSync, getSyncState } from '@/lib/gmail/sync'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { full = false } = await req.json().catch(() => ({}))
  const userId = session.user.id

  if (full) {
    const result = await fullSync(userId)
    return NextResponse.json({ data: result })
  }

  const state = await getSyncState(userId)
  if (state?.gmailHistoryId) {
    const result = await incrementalSync(userId, state.gmailHistoryId)
    return NextResponse.json({ data: result })
  }

  const result = await fullSync(userId)
  return NextResponse.json({ data: result })
}
