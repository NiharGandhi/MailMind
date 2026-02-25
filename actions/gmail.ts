'use server'

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { emailThreads, emailMessages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
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

export async function getThreadAction(threadId: string) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const thread = await db.query.emailThreads.findFirst({
    where: and(eq(emailThreads.id, threadId), eq(emailThreads.userId, session.user.id)),
  })
  if (!thread) return null

  const messages = await db.query.emailMessages.findMany({
    where: and(eq(emailMessages.threadId, threadId), eq(emailMessages.userId, session.user.id)),
    orderBy: [desc(emailMessages.sentAt)],
  })

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
  for (const msg of messages) {
    await markAsRead(session.user.id, msg.gmailMessageId).catch(() => {})
  }
  await db.update(emailThreads).set({ isRead: true, updatedAt: new Date() })
    .where(and(eq(emailThreads.id, threadId), eq(emailThreads.userId, session.user.id)))

  revalidatePath('/inbox')
}

export async function toggleStarAction(threadId: string, starred: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  await db.update(emailThreads).set({ isStarred: starred, updatedAt: new Date() })
    .where(and(eq(emailThreads.id, threadId), eq(emailThreads.userId, session.user.id)))
  revalidatePath('/inbox')
}
