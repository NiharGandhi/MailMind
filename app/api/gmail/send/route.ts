import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { sendEmail } from '@/lib/gmail/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject, body, threadId, cc } = await req.json()
  if (!to || !subject || !body) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const result = await sendEmail(session.user.id, { to, subject, body, threadId, cc })
  return NextResponse.json({ data: result })
}
