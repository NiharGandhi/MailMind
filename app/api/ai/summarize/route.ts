import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAIProvider, logSuggestion } from '@/lib/ai/providers'
import { buildEmailContext } from '@/lib/ai/context-builder'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { threadId } = await req.json()
  if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 })

  const userId = session.user.id
  const ctx = await buildEmailContext(userId, threadId, session.user.email!, session.user.name ?? '')

  const provider = await getAIProvider(userId)
  const { summary, promptTokens, completionTokens } = await provider.summarizeThread(ctx.messages, ctx.thread.subject)

  await logSuggestion({
    userId, threadId, suggestionType: 'summary',
    modelUsed: provider.modelId, promptTokens, completionTokens, content: summary,
  })

  return NextResponse.json({ data: { summary } })
}
