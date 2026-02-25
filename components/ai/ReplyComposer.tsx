'use client'

import { useAIStream } from '@/hooks/useAIStream'
import { useAIStore } from '@/stores/aiStore'
import { useEmailStore } from '@/stores/emailStore'
import { sendEmailAction } from '@/actions/gmail'
import { Sparkles, Send, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReplyComposerProps {
  threadId: string
}

export function ReplyComposer({ threadId }: ReplyComposerProps) {
  const { getCache, setReply, setSelectedTone, setEditedBody } = useAIStore()
  const cache = getCache(threadId)
  const { result, selectedTone, editedBody } = {
    result: cache.reply,
    selectedTone: cache.selectedTone,
    editedBody: cache.editedBody,
  }

  const { selectedThread } = useEmailStore()
  const { streamedText, isStreaming, stream } = useAIStream({
    onComplete: (r) => { if (r) setReply(threadId, r) },
  })

  function handleGenerate() {
    // Clear cached reply before re-generating
    setReply(threadId, { variants: [], schedulingNotes: null, suggestedMeetingTimes: [], keyActionItems: [], priority: 'medium', sentiment: 'neutral' })
    stream(threadId, 'reply')
  }

  async function handleSend() {
    if (!selectedThread || !editedBody) return
    const variant = result?.variants.find((v) => v.tone === selectedTone)
    await sendEmailAction({
      to: selectedThread.participants[0]?.email ?? '',
      subject: variant?.subject ?? `Re: ${selectedThread.subject}`,
      body: editedBody,
      threadId: selectedThread.gmailThreadId,
    })
  }

  const hasResult = result && result.variants.length > 0

  return (
    <div className="space-y-3">
      {!hasResult && !isStreaming && (
        <Button onClick={handleGenerate} className="w-full">
          <Sparkles size={13} />
          Generate Reply
        </Button>
      )}

      {isStreaming && (
        <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
          <p className="mb-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>Generating...</p>
          <div className="streaming-cursor text-sm" style={{ color: 'var(--text)' }}>
            {streamedText.slice(0, 200)}
          </div>
        </div>
      )}

      {hasResult && !isStreaming && (
        <div className="space-y-3">
          {/* Priority / sentiment */}
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 text-xs"
              style={{
                background: result.priority === 'high' ? 'rgba(239,68,68,0.15)' : result.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                color: result.priority === 'high' ? '#f87171' : result.priority === 'medium' ? '#fbbf24' : '#34d399',
              }}
            >
              {result.priority} priority
            </span>
            <span className="rounded px-1.5 py-0.5 text-xs capitalize" style={{ background: 'var(--border)', color: 'var(--muted)' }}>
              {result.sentiment}
            </span>
          </div>

          {/* Tone selector */}
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {(['professional', 'casual', 'brief'] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(threadId, tone)}
                className="flex-1 py-1.5 text-xs font-medium capitalize transition-colors"
                style={{
                  background: selectedTone === tone ? 'var(--accent)' : 'transparent',
                  color: selectedTone === tone ? 'white' : 'var(--muted)',
                }}
              >
                {tone}
              </button>
            ))}
          </div>

          {/* Editable body */}
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(threadId, e.target.value)}
            rows={6}
            className="w-full rounded-lg border bg-transparent p-3 text-sm resize-none focus:outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />

          {/* Action items */}
          {result.keyActionItems.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium" style={{ color: 'var(--muted)' }}>Action items</p>
              <ul className="space-y-1">
                {result.keyActionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text)' }}>
                    <span style={{ color: 'var(--accent)' }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scheduling notes */}
          {result.schedulingNotes && (
            <div className="rounded-lg border p-2.5" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{result.schedulingNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={!editedBody} className="flex-1">
              <Send size={13} />
              Send
            </Button>
            <Button variant="ghost" onClick={handleGenerate} title="Regenerate">
              <RefreshCw size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
