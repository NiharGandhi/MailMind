'use client'

import { useState } from 'react'
import type { EmailMessage } from '@/types'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/utils/email-parser'

interface MessageBubbleProps {
  message: EmailMessage
  defaultExpanded?: boolean
}

export function MessageBubble({ message, defaultExpanded = false }: MessageBubbleProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const from = message.fromName || message.fromEmail
  const initials = from.slice(0, 2).toUpperCase()

  return (
    <div className={cn('rounded-lg border', expanded ? '' : 'opacity-75 hover:opacity-100')}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <button
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: '#6366f1', color: 'white' }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{from}</span>
              <span className="ml-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                &lt;{message.fromEmail}&gt;
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {format(message.sentAt, 'MMM d, h:mm a')}
              </span>
              {expanded ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
            </div>
          </div>

          {!expanded && (
            <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--muted)' }}>
              {message.snippet || ''}
            </p>
          )}

          {expanded && (
            <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              <span>To: </span>
              {message.toRecipients.map((r) => r.name || r.email).join(', ')}
            </div>
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4">
          <div
            className="pl-11 text-sm leading-relaxed"
            style={{ color: 'var(--text)' }}
          >
            {message.bodyHtml ? (
              <div
                className="prose prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.bodyHtml) }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {message.bodyText || message.snippet || '(no content)'}
              </pre>
            )}
          </div>

          {message.attachments.length > 0 && (
            <div className="mt-4 pl-11 flex flex-wrap gap-2">
              {message.attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-xs"
                  style={{ background: 'var(--border)', color: 'var(--muted)' }}
                >
                  <Paperclip size={11} />
                  {att.filename}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
