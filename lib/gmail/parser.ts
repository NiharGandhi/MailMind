import { decodeBase64Url, parseEmailAddresses } from '@/lib/utils/email-parser'
import type { EmailParticipant, EmailAttachment } from '@/types'

export interface ParsedMessage {
  bodyHtml: string | null
  bodyText: string | null
  snippet: string | null
  fromEmail: string
  fromName: string | null
  toRecipients: EmailParticipant[]
  ccRecipients: EmailParticipant[]
  subject: string
  sentAt: Date
  attachments: EmailAttachment[]
  messageId: string
}

interface GmailPart {
  mimeType?: string
  body?: { data?: string; attachmentId?: string; size?: number }
  parts?: GmailPart[]
  headers?: Array<{ name: string; value: string }>
  filename?: string
  labelIds?: string[]
}

function getHeader(headers: Array<{ name: string; value: string }> = [], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function extractBody(
  part: GmailPart,
  result: { html: string | null; text: string | null; attachments: EmailAttachment[] }
): void {
  if (part.parts) {
    for (const sub of part.parts) extractBody(sub, result)
    return
  }
  const mime = (part.mimeType ?? '').toLowerCase()
  if (part.body?.attachmentId && part.filename) {
    result.attachments.push({
      filename: part.filename,
      mimeType: part.mimeType ?? '',
      size: part.body.size ?? 0,
      attachmentId: part.body.attachmentId,
    })
    return
  }
  if (!part.body?.data) return
  if (mime === 'text/html') result.html = decodeBase64Url(part.body.data)
  else if (mime === 'text/plain') result.text = decodeBase64Url(part.body.data)
}

export function parseGmailMessage(raw: {
  id: string
  snippet?: string | null
  internalDate?: string
  payload?: GmailPart
}): ParsedMessage {
  const headers = raw.payload?.headers ?? []
  const fromRaw = getHeader(headers, 'From')

  let fromEmail = fromRaw.trim().toLowerCase()
  let fromName: string | null = null
  const fromMatch = fromRaw.match(/^(.*?)\s*<([^>]+)>$/)
  if (fromMatch) {
    fromName = fromMatch[1].trim().replace(/^"|"$/g, '') || null
    fromEmail = fromMatch[2].trim().toLowerCase()
  }

  const dateRaw = getHeader(headers, 'Date')
  let sentAt: Date
  try {
    sentAt = dateRaw ? new Date(dateRaw) : new Date(parseInt(raw.internalDate ?? '0'))
  } catch {
    sentAt = new Date(parseInt(raw.internalDate ?? '0'))
  }

  const extracted = { html: null as string | null, text: null as string | null, attachments: [] as EmailAttachment[] }
  if (raw.payload) {
    if (raw.payload.body?.data) {
      const mime = (raw.payload.mimeType ?? '').toLowerCase()
      if (mime === 'text/html') extracted.html = decodeBase64Url(raw.payload.body.data)
      else extracted.text = decodeBase64Url(raw.payload.body.data)
    } else if (raw.payload.parts) {
      extractBody(raw.payload, extracted)
    }
  }

  return {
    bodyHtml: extracted.html,
    bodyText: extracted.text,
    snippet: raw.snippet ?? null,
    fromEmail,
    fromName,
    toRecipients: parseEmailAddresses(getHeader(headers, 'To')).map((p) => ({
      email: p.email,
      name: p.name ?? undefined,
    })),
    ccRecipients: parseEmailAddresses(getHeader(headers, 'Cc')).map((p) => ({
      email: p.email,
      name: p.name ?? undefined,
    })),
    subject: getHeader(headers, 'Subject') || '(no subject)',
    sentAt,
    attachments: extracted.attachments,
    messageId: raw.id,
  }
}
