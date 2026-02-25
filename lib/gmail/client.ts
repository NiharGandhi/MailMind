import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { db } from '@/lib/db'
import { accounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function getOAuth2Client(userId: string): Promise<OAuth2Client> {
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, userId),
  })
  if (!account?.access_token) throw new Error('No Google account linked')

  const oauth2 = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  oauth2.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  })

  oauth2.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await db.update(accounts).set({
        access_token: tokens.access_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
      }).where(eq(accounts.userId, userId))
    }
  })

  return oauth2
}

export async function getGmailClient(userId: string) {
  return google.gmail({ version: 'v1', auth: await getOAuth2Client(userId) })
}

export async function getThreads(userId: string, opts: { maxResults?: number; pageToken?: string; labelIds?: string[] } = {}) {
  const gmail = await getGmailClient(userId)
  const res = await gmail.users.threads.list({
    userId: 'me',
    maxResults: opts.maxResults ?? 50,
    pageToken: opts.pageToken,
    labelIds: opts.labelIds,
  })
  return res.data
}

export async function getThread(userId: string, threadId: string) {
  const gmail = await getGmailClient(userId)
  const res = await gmail.users.threads.get({ userId: 'me', id: threadId, format: 'full' })
  return res.data
}

export async function sendEmail(userId: string, params: {
  to: string
  subject: string
  body: string
  threadId?: string
  cc?: string
  inReplyTo?: string
}) {
  const gmail = await getGmailClient(userId)
  const lines = [
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : null,
    `Subject: ${params.subject}`,
    params.inReplyTo ? `In-Reply-To: ${params.inReplyTo}` : null,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    params.body,
  ].filter(Boolean).join('\r\n')

  const raw = Buffer.from(lines).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw, threadId: params.threadId },
  })
  return res.data
}

export async function markAsRead(userId: string, messageId: string) {
  const gmail = await getGmailClient(userId)
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: ['UNREAD'] },
  })
}

export async function getLabels(userId: string) {
  const gmail = await getGmailClient(userId)
  const res = await gmail.users.labels.list({ userId: 'me' })
  return res.data.labels ?? []
}

export async function getHistory(userId: string, startHistoryId: string) {
  const gmail = await getGmailClient(userId)
  try {
    const res = await gmail.users.history.list({
      userId: 'me',
      startHistoryId,
      historyTypes: ['messageAdded', 'messageDeleted', 'labelAdded', 'labelRemoved'],
    })
    return res.data
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 404) return null
    throw err
  }
}

export async function getProfile(userId: string) {
  const gmail = await getGmailClient(userId)
  const res = await gmail.users.getProfile({ userId: 'me' })
  return res.data
}
