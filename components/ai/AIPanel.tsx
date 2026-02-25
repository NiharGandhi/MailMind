'use client'

import { useUIStore } from '@/stores/uiStore'
import { useEmailStore } from '@/stores/emailStore'
import { X, Sparkles } from 'lucide-react'
import { ReplyComposer } from './ReplyComposer'
import { ThreadSummary } from './ThreadSummary'
import { ScheduleSuggestion } from './ScheduleSuggestion'
import { ModelSelector } from './ModelSelector'

const TABS = [
  { id: 'reply', label: 'Reply' },
  { id: 'summary', label: 'Summary' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'insights', label: 'Insights' },
] as const

export function AIPanel() {
  const { aiPanelOpen, setAIPanelOpen, activeAITab, setActiveAITab } = useUIStore()
  const { selectedThreadId, selectedThread } = useEmailStore()

  if (!aiPanelOpen || !selectedThreadId) return null

  return (
    <div
      className="flex h-full w-[380px] shrink-0 flex-col border-l slide-in-right"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector />
          <button
            onClick={() => setAIPanelOpen(false)}
            className="rounded p-1 transition-colors hover:bg-white/5"
          >
            <X size={14} style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAITab(tab.id)}
            className="flex-1 px-2 py-2.5 text-xs font-medium transition-colors"
            style={{
              color: activeAITab === tab.id ? 'var(--accent)' : 'var(--muted)',
              borderBottom: activeAITab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeAITab === 'reply' && <ReplyComposer threadId={selectedThreadId} />}
        {activeAITab === 'summary' && <ThreadSummary threadId={selectedThreadId} />}
        {activeAITab === 'schedule' && <ScheduleSuggestion threadId={selectedThreadId} />}
        {activeAITab === 'insights' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Thread: <span style={{ color: 'var(--text)' }}>{selectedThread?.subject}</span>
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Messages: <span style={{ color: 'var(--text)' }}>{selectedThread?.messageCount}</span>
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Participants: <span style={{ color: 'var(--text)' }}>
                {selectedThread?.participants.map((p) => p.name || p.email).join(', ')}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
