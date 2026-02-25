import { db } from '@/lib/db'
import { emailThreads, emailMessages, calendarEvents, userPreferences } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import type { EmailContext, ScheduleContext } from '@/types'

async function getOrCreatePrefs(userId: string) {
  let prefs = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) })
  if (!prefs) {
    const [created] = await db.insert(userPreferences).values({ userId }).returning()
    prefs = created
  }
  return prefs
}

export async function buildEmailContext(
  userId: string,
  threadId: string,
  userEmail: string,
  userName: string
): Promise<EmailContext> {
  const thread = await db.query.emailThreads.findFirst({
    where: and(eq(emailThreads.id, threadId), eq(emailThreads.userId, userId)),
  })
  if (!thread) throw new Error('Thread not found')

  const messages = await db.query.emailMessages.findMany({
    where: and(eq(emailMessages.threadId, threadId), eq(emailMessages.userId, userId)),
    orderBy: (t, { asc }) => [asc(t.sentAt)],
    limit: 10,
  })

  const calEvents = await db.query.calendarEvents.findMany({
    where: and(eq(calendarEvents.userId, userId), gte(calendarEvents.startTime, new Date())),
    orderBy: (t, { asc }) => [asc(t.startTime)],
    limit: 10,
  })

  const prefs = await getOrCreatePrefs(userId)

  return { thread, messages, calendarEvents: calEvents, userPreferences: prefs, userEmail, userName: userName || userEmail }
}

export async function buildScheduleContext(userId: string, threadId: string): Promise<ScheduleContext> {
  const thread = await db.query.emailThreads.findFirst({
    where: and(eq(emailThreads.id, threadId), eq(emailThreads.userId, userId)),
  })
  if (!thread) throw new Error('Thread not found')

  const messages = await db.query.emailMessages.findMany({
    where: and(eq(emailMessages.threadId, threadId), eq(emailMessages.userId, userId)),
    orderBy: (t, { asc }) => [asc(t.sentAt)],
    limit: 5,
  })

  const calEvents = await db.query.calendarEvents.findMany({
    where: and(eq(calendarEvents.userId, userId), gte(calendarEvents.startTime, new Date())),
    orderBy: (t, { asc }) => [asc(t.startTime)],
    limit: 15,
  })

  const prefs = await getOrCreatePrefs(userId)
  return { thread, messages, calendarEvents: calEvents, userPreferences: prefs, durationMinutes: 60 }
}
