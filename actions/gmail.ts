'use server'

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { emailThreads, emailMessages } from '@/lib/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { sendEmail, markAsRead } from '@/lib/gmail/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getThreadsAction(limit = 50) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')
  return db.query.emailThreads.findMany({
    where: eq(emailThreads.userId, session.user.id),
    orderBy: [desc(emailThreads.lastMessageAt)],
    limit,
  })
}

export async function getStarredThreadsAction(limit = 50) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')
  return db.query.emailThreads.findMany({
    where: and(
      eq(emailThreads.userId, session.user.id),
      eq(emailThreads.isStarred, true)
    ),
    orderBy: [desc(emailThreads.lastMessageAt)],
    limit,
  })
}

export async function getSentThreadsAction(limit = 50) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')
  // Sent threads are those where the user sent at least one outbound message
  const sentMessages = await db.query.emailMessages.findMany({
    where: and(
      eq(emailMessages.userId, session.user.id),
      eq(emailMessages.isOutbound, true)
    ),
    orderBy: [desc(emailMessages.sentAt)],
  })
  // Deduplicate threadIds while preserving order
  const seenThreadIds = new Set<string>()
  const uniqueThreadIds: string[] = []
  for (const msg of sentMessages) {
    if (!seenThreadIds.has(msg.threadId)) {
      seenThreadIds.add(msg.threadId)
      uniqueThreadIds.push(msg.threadId)
    }
    if (uniqueThreadIds.length >= limit) break
  }
  if (uniqueThreadIds.length === 0) return []
  const threads = await db.query.emailThreads.findMany({
    where: and(
      eq(emailThreads.userId, session.user.id),
      inArray(emailThreads.id, uniqueThreadIds)
    ),
  })
  const threadMap = new Map(threads.map((t) => [t.id, t]))
  return uniqueThreadIds.map((id) => threadMap.get(id)!).filter(Boolean)
}

export async function getThreadAction(threadId: string) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const [thread, messages] = await Promise.all([
    db.query.emailThreads.findFirst({
      where: and(eq(emailThreads.id, threadId), eq(emailThreads.userId, session.user.id)),
    }),
    db.query.emailMessages.findMany({
      where: and(eq(emailMessages.threadId, threadId), eq(emailMessages.userId, session.user.id)),
      orderBy: [desc(emailMessages.sentAt)],
    }),
  ])

  if (!thread) return null
  return { thread, messages: messages.reverse() }
}

export async function sendEmailAction(params: {
  to: string
  subject: string
  body: string
  threadId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  await sendEmail(session.user.id, params)
  revalidatePath('/inbox')
}

export async function markThreadReadAction(threadId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const messages = await db.query.emailMessages.findMany({
    where: and(eq(emailMessages.threadId, threadId), eq(emailMessages.userId, session.user.id)),
  })

  // Fire all Gmail API calls in parallel — don't block on failures
  await Promise.all([
    ...messages.map((msg) => markAsRead(session.user.id, msg.gmailMessageId).catch(() => {})),
    db.update(emailThreads).set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(emailThreads.id, threadId), eq(emailThreads.userId, session.user.id))),
  ])
}

export async function toggleStarAction(threadId: string, starred: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  await db.update(emailThreads).set({ isStarred: starred, updatedAt: new Date() })
    .where(and(eq(emailThreads.id, threadId), eq(emailThreads.userId, session.user.id)))
  // Only revalidate starred page since that's the only place the change is visible as a list change
  revalidatePath('/starred')
}
