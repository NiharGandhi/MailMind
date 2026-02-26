'use client'

import { useEmailStore } from '@/stores/emailStore'
import { useUIStore } from '@/stores/uiStore'
import { formatEmailDate } from '@/lib/utils/date'
import type { EmailThread } from '@/types'
import { Star, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleStarAction } from '@/actions/gmail'

interface ThreadListProps {
  threads: EmailThread[]
  emptyIcon?: string
  emptyMessage?: string
  emptySubMessage?: string
}

export function ThreadList({
  threads,
  emptyIcon = '📭',
  emptyMessage = 'No emails yet',
  emptySubMessage = 'Your synced emails will appear here',
}: ThreadListProps) {
  const { selectedThreadId, setSelectedThread } = useEmailStore()
  const { setAIPanelOpen, setMobileView } = useUIStore()

  function handleSelect(thread: EmailThread) {
    setSelectedThread(thread.id, thread)
    setAIPanelOpen(true)
    setMobileView('thread')
  }

  if (!threads.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-8">
        <div className="mb-3 text-4xl">{emptyIcon}</div>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{emptyMessage}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          {emptySubMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
      {threads.map((thread) => (
        <ThreadRow
          key={thread.id}
          thread={thread}
          isSelected={selectedThreadId === thread.id}
          onSelect={() => handleSelect(thread)}
        />
      ))}
    </div>
  )
}

function ThreadRow({
  thread,
  isSelected,
  onSelect,
}: {
  thread: EmailThread
  isSelected: boolean
  onSelect: () => void
}) {
  const firstParticipant = thread.participants[0]
  const displayName = firstParticipant?.name || firstParticipant?.email || 'Unknown'
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleStar(e: React.MouseEvent) {
    e.stopPropagation()
    await toggleStarAction(thread.id, !thread.isStarred)
  }

  const hasAttachments = thread.labels.some(l => l.includes('ATTACHMENT')) // heuristic

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group',
        isSelected
          ? 'border-l-2'
          : 'border-l-2 border-transparent hover:bg-white/[0.03]',
      )}
      style={isSelected ? { background: 'var(--surface)', borderLeftColor: 'var(--accent)' } : {}}
    >
      {/* Avatar */}
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ background: stringToColor(displayName), color: 'white' }}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn('text-sm truncate', !thread.isRead && 'font-semibold')}
            style={{ color: 'var(--text)' }}
          >
            {displayName}
            {thread.messageCount > 1 && (
              <span className="ml-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                {thread.messageCount}
              </span>
            )}
          </span>
          <span className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
            {formatEmailDate(thread.lastMessageAt)}
          </span>
        </div>

        <p
          className={cn('text-sm truncate mt-0.5', !thread.isRead && 'font-medium')}
          style={{ color: !thread.isRead ? 'var(--text)' : 'var(--muted)' }}
        >
          {thread.subject}
        </p>

        <div className="flex items-center justify-between mt-1 gap-2">
          <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
            {thread.snippet ? truncateText(thread.snippet, 80) : ''}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {hasAttachments && <Paperclip size={11} style={{ color: 'var(--muted)' }} />}
            <button
              onClick={handleStar}
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity',
                thread.isStarred && 'opacity-100'
              )}
            >
              <Star
                size={13}
                className={thread.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}
                style={!thread.isStarred ? { color: 'var(--muted)' } : {}}
              />
            </button>
            {!thread.isRead && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  return colors[Math.abs(hash) % colors.length]
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 3) + '...'
}
