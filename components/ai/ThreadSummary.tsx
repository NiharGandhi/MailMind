'use client'

import { useAIStore } from '@/stores/aiStore'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ThreadSummaryProps {
  threadId: string
}

export function ThreadSummary({ threadId }: ThreadSummaryProps) {
  const { getCache, setSummary } = useAIStore()
  const summary = getCache(threadId).summary
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      })
      const data = await res.json()
      if (data.data?.summary) setSummary(threadId, data.data.summary)
    } catch {
      setSummary(threadId, 'Failed to generate summary.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {!summary && !loading && (
        <Button onClick={generate} className="w-full">
          <Sparkles size={13} />
          Summarize Thread
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Analyzing thread...</span>
        </div>
      )}

      {summary && (
        <div className="space-y-3">
          <pre
            className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
            style={{ color: 'var(--text)' }}
          >
            {summary}
          </pre>
          <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
            <RefreshCw size={12} /> Regenerate
          </Button>
        </div>
      )}
    </div>
  )
}
