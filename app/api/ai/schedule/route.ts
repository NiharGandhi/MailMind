import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAIProvider, logSuggestion } from '@/lib/ai/providers'
import { buildScheduleContext } from '@/lib/ai/context-builder'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { threadId } = await req.json()
  if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 })

  const userId = session.user.id
  const ctx = await buildScheduleContext(userId, threadId)

  const provider = await getAIProvider(userId)
  const { suggestions, promptTokens, completionTokens } = await provider.suggestSchedule(ctx)

  await logSuggestion({
    userId, threadId, suggestionType: 'schedule',
    modelUsed: provider.modelId, promptTokens, completionTokens, content: suggestions,
  })

  return NextResponse.json({ data: { suggestions, hasSchedulingIntent: suggestions.length > 0 } })
}
