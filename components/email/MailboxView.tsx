'use client'

import { useEmailStore } from '@/stores/emailStore'
import { useUIStore } from '@/stores/uiStore'
import { ThreadList } from '@/components/email/ThreadList'
import { AIPanel } from '@/components/ai/AIPanel'
import { ThreadViewClient } from '@/app/(dashboard)/inbox/[threadId]/ThreadViewClient'
import { Search } from 'lucide-react'
import type { EmailThread } from '@/types'
import { useState } from 'react'

interface MailboxViewProps {
  initialThreads: EmailThread[]
  title: string
  emptyIcon?: string
  emptyMessage?: string
  emptySubMessage?: string
}

export function MailboxView({
  initialThreads,
  title,
  emptyIcon = '📭',
  emptyMessage = 'No emails here',
  emptySubMessage = 'Your emails will appear here',
}: MailboxViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedThreadId } = useEmailStore()
  const { aiPanelOpen } = useUIStore()

  const filtered = searchQuery
    ? initialThreads.filter(
        (t) =>
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.participants.some(
            (p) =>
              p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : initialThreads

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Thread list pane */}
      <div className="flex w-[320px] shrink-0 flex-col border-r" style={{ borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <Search size={13} style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Count */}
        <div className="px-4 py-2 text-xs" style={{ color: 'var(--muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'thread' : 'threads'}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <ThreadList
            threads={filtered}
            emptyIcon={emptyIcon}
            emptyMessage={emptyMessage}
            emptySubMessage={emptySubMessage}
          />
        </div>
      </div>

      {/* Thread detail pane */}
      <div className="flex flex-1 overflow-hidden">
        {selectedThreadId ? (
          <ThreadViewClient threadId={selectedThreadId} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">{emptyIcon}</div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Select a thread to read</p>
            </div>
          </div>
        )}
        {aiPanelOpen && <AIPanel />}
      </div>
    </div>
  )
}
