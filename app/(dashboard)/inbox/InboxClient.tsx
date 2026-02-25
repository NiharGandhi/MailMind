'use client'

import { useEmailStore } from '@/stores/emailStore'
import { useUIStore } from '@/stores/uiStore'
import { ThreadList } from '@/components/email/ThreadList'
import { AIPanel } from '@/components/ai/AIPanel'
import { ThreadViewClient } from './[threadId]/ThreadViewClient'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { EmailThread } from '@/types'
import { useEffect } from 'react'

interface InboxClientProps {
  initialThreads: EmailThread[]
}

export function InboxClient({ initialThreads }: InboxClientProps) {
  const { searchQuery, setSearchQuery, selectedThreadId } = useEmailStore()
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
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5" style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <Search size={13} style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              style={{ color: 'var(--text)' }}
            />
          </div>
          <button className="rounded p-1 transition-colors hover:bg-white/5">
            <SlidersHorizontal size={14} style={{ color: 'var(--muted)' }} />
          </button>
        </div>

        {/* Count */}
        <div className="px-4 py-2 text-xs" style={{ color: 'var(--muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'thread' : 'threads'}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <ThreadList threads={filtered} />
        </div>
      </div>

      {/* Thread detail pane */}
      <div className="flex flex-1 overflow-hidden">
        {selectedThreadId ? (
          <ThreadViewClient threadId={selectedThreadId} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Select a thread to read</p>
            </div>
          </div>
        )}

        {/* AI Panel */}
        {aiPanelOpen && <AIPanel />}
      </div>
    </div>
  )
}
