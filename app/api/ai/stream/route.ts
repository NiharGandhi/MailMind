import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAIProvider } from '@/lib/ai/providers'
import { buildEmailContext } from '@/lib/ai/context-builder'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { threadId } = await req.json()
  if (!threadId) return new Response('threadId required', { status: 400 })

  const userId = session.user.id
  const ctx = await buildEmailContext(userId, threadId, session.user.email!, session.user.name ?? '')
  const provider = await getAIProvider(userId)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of provider.streamReply(ctx)) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
