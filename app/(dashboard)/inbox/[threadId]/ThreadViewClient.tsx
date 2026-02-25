'use client'

import { useEffect, useState } from 'react'
import { MessageBubble } from '@/components/email/MessageBubble'
import { useEmailStore } from '@/stores/emailStore'
import { useUIStore } from '@/stores/uiStore'
import { getThreadAction, markThreadReadAction } from '@/actions/gmail'
import type { EmailThread, EmailMessage } from '@/types'
import { ArrowLeft, Sparkles, MoreHorizontal, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleStarAction } from '@/actions/gmail'

interface ThreadViewClientProps {
  threadId: string
  initialData?: { thread: EmailThread; messages: EmailMessage[] }
}

export function ThreadViewClient({ threadId, initialData }: ThreadViewClientProps) {
  const [data, setData] = useState(initialData ?? null)
  const { setSelectedThread } = useEmailStore()
  const { setAIPanelOpen, setMobileView, aiPanelOpen } = useUIStore()

  useEffect(() => {
    if (!initialData) {
      getThreadAction(threadId).then((d) => {
        if (d) {
          setData(d)
          setSelectedThread(threadId, d.thread)
        }
      })
    } else {
      setSelectedThread(threadId, initialData.thread)
    }
  }, [threadId])

  useEffect(() => {
    if (data?.thread && !data.thread.isRead) {
      markThreadReadAction(threadId).catch(() => {})
    }
  }, [data?.thread?.id])

  if (!data) {
    return (
      <div className="flex flex-1 flex-col">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="m-4 h-24 animate-pulse rounded-lg" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    )
  }

  const { thread, messages } = data

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <button
          className="rounded p-1 hover:bg-white/5 md:hidden"
          onClick={() => setMobileView('list')}
        >
          <ArrowLeft size={16} style={{ color: 'var(--muted)' }} />
        </button>

        <h1 className="flex-1 truncate text-base font-medium" style={{ color: 'var(--text)' }}>
          {thread.subject}
        </h1>

        <div className="flex items-center gap-1">
          <button
            className="rounded p-1.5 hover:bg-white/5"
            onClick={() => toggleStarAction(threadId, !thread.isStarred)}
          >
            <Star size={15} className={thread.isStarred ? 'fill-yellow-400 text-yellow-400' : ''} style={!thread.isStarred ? { color: 'var(--muted)' } : {}} />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setAIPanelOpen(!aiPanelOpen) }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            AI
          </Button>

          <button className="rounded p-1.5 hover:bg-white/5">
            <MoreHorizontal size={15} style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            defaultExpanded={i === messages.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
