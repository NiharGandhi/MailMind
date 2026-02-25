import { db } from '@/lib/db'
import { emailThreads, emailMessages, syncState } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getThreads, getThread, getHistory, getProfile } from './client'
import { parseGmailMessage } from './parser'
import type { GmailSyncResult } from '@/types'

async function upsertThread(userId: string, gmailThreadId: string) {
  const thread = await getThread(userId, gmailThreadId)
  if (!thread.messages?.length) return

  const messages = thread.messages
  const lastMsg = messages[messages.length - 1]
  const parsedLast = parseGmailMessage(lastMsg as Parameters<typeof parseGmailMessage>[0])

  const participantMap = new Map<string, { email: string; name?: string }>()
  for (const msg of messages) {
    const p = parseGmailMessage(msg as Parameters<typeof parseGmailMessage>[0])
    participantMap.set(p.fromEmail, { email: p.fromEmail, name: p.fromName ?? undefined })
  }

  const labels = (lastMsg as { labelIds?: string[] }).labelIds ?? []
  const isRead = !labels.includes('UNREAD')
  const isStarred = labels.includes('STARRED')

  const existing = await db.query.emailThreads.findFirst({
    where: and(eq(emailThreads.userId, userId), eq(emailThreads.gmailThreadId, gmailThreadId)),
  })

  let threadId: string

  if (existing) {
    await db.update(emailThreads).set({
      subject: parsedLast.subject,
      snippet: thread.snippet ?? null,
      lastMessageAt: parsedLast.sentAt,
      isRead,
      isStarred,
      labels,
      participants: Array.from(participantMap.values()),
      messageCount: messages.length,
      updatedAt: new Date(),
    }).where(eq(emailThreads.id, existing.id))
    threadId = existing.id
  } else {
    const [row] = await db.insert(emailThreads).values({
      userId,
      gmailThreadId,
      subject: parsedLast.subject,
      snippet: thread.snippet ?? null,
      lastMessageAt: parsedLast.sentAt,
      isRead,
      isStarred,
      labels,
      participants: Array.from(participantMap.values()),
      messageCount: messages.length,
    }).returning()
    threadId = row.id
  }

  for (const rawMsg of messages) {
    const p = parseGmailMessage(rawMsg as Parameters<typeof parseGmailMessage>[0])
    const exists = await db.query.emailMessages.findFirst({
      where: and(eq(emailMessages.userId, userId), eq(emailMessages.gmailMessageId, p.messageId)),
    })
    if (exists) continue

    const msgLabels = (rawMsg as { labelIds?: string[] }).labelIds ?? []
    await db.insert(emailMessages).values({
      threadId,
      userId,
      gmailMessageId: p.messageId,
      fromEmail: p.fromEmail,
      fromName: p.fromName,
      toRecipients: p.toRecipients,
      ccRecipients: p.ccRecipients,
      bodyHtml: p.bodyHtml,
      bodyText: p.bodyText,
      snippet: p.snippet,
      sentAt: p.sentAt,
      isOutbound: msgLabels.includes('SENT'),
      attachments: p.attachments,
    })
  }

  return threadId
}

export async function fullSync(userId: string): Promise<GmailSyncResult> {
  let threadsProcessed = 0, messagesProcessed = 0, newHistoryId: string | null = null

  try {
    const profile = await getProfile(userId)
    newHistoryId = profile.historyId ?? null

    let pageToken: string | undefined
    let totalFetched = 0

    do {
      const result = await getThreads(userId, { maxResults: 20, pageToken, labelIds: ['INBOX'] })
      if (!result.threads?.length) break

      for (const t of result.threads) {
        if (t.id) {
          await upsertThread(userId, t.id)
          threadsProcessed++
          messagesProcessed++
        }
        if (++totalFetched >= 100) break
      }

      pageToken = totalFetched < 100 ? (result.nextPageToken ?? undefined) : undefined
    } while (pageToken)

    await db.insert(syncState).values({
      userId, lastGmailSync: new Date(), gmailHistoryId: newHistoryId, syncStatus: 'idle',
    }).onConflictDoUpdate({
      target: syncState.userId,
      set: { lastGmailSync: new Date(), gmailHistoryId: newHistoryId, syncStatus: 'idle', updatedAt: new Date() },
    })
  } catch (error) {
    await db.insert(syncState).values({ userId, syncStatus: 'error' }).onConflictDoUpdate({
      target: syncState.userId,
      set: { syncStatus: 'error', updatedAt: new Date() },
    })
    return { threadsProcessed, messagesProcessed, newHistoryId, error: String(error) }
  }

  return { threadsProcessed, messagesProcessed, newHistoryId }
}

export async function incrementalSync(userId: string, historyId: string): Promise<GmailSyncResult> {
  let threadsProcessed = 0, messagesProcessed = 0, newHistoryId: string | null = null

  try {
    const history = await getHistory(userId, historyId)
    if (!history) return fullSync(userId)

    newHistoryId = history.historyId ?? null
    const seen = new Set<string>()

    for (const record of history.history ?? []) {
      for (const added of record.messagesAdded ?? []) {
        const tId = added.message?.threadId
        if (tId && !seen.has(tId)) {
          seen.add(tId)
          await upsertThread(userId, tId)
          threadsProcessed++
          messagesProcessed++
        }
      }
    }

    await db.insert(syncState).values({
      userId, lastGmailSync: new Date(), gmailHistoryId: newHistoryId, syncStatus: 'idle',
    }).onConflictDoUpdate({
      target: syncState.userId,
      set: { lastGmailSync: new Date(), gmailHistoryId: newHistoryId, syncStatus: 'idle', updatedAt: new Date() },
    })
  } catch (error) {
    return { threadsProcessed, messagesProcessed, newHistoryId, error: String(error) }
  }

  return { threadsProcessed, messagesProcessed, newHistoryId }
}

export async function getSyncState(userId: string) {
  return db.query.syncState.findFirst({ where: eq(syncState.userId, userId) })
}
