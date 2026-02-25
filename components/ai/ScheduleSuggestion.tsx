'use client'

import { useAIStore } from '@/stores/aiStore'
import { Calendar, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { ScheduleSuggestion as SuggestionType } from '@/types'
import { format, parseISO } from 'date-fns'

interface ScheduleSuggestionProps {
  threadId: string
}

export function ScheduleSuggestion({ threadId }: ScheduleSuggestionProps) {
  const { getCache, setSchedule } = useAIStore()
  const { schedule, scheduleChecked, scheduleHasIntent } = getCache(threadId)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      })
      const data = await res.json()
      setSchedule(
        threadId,
        data.data?.suggestions ?? [],
        data.data?.hasSchedulingIntent ?? false
      )
    } catch {
      setSchedule(threadId, [], false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {!scheduleChecked && !loading && (
        <Button onClick={generate} className="w-full">
          <Calendar size={13} />
          Find Meeting Times
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <Sparkles size={14} className="animate-pulse" style={{ color: 'var(--accent)' }} />
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Checking calendar...</span>
        </div>
      )}

      {scheduleChecked && !scheduleHasIntent && !loading && (
        <div className="rounded-lg border p-3 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No scheduling intent detected in this thread.
          </p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={generate}>
            Check anyway
          </Button>
        </div>
      )}

      {scheduleChecked && scheduleHasIntent && schedule?.length === 0 && !loading && (
        <p className="py-4 text-center text-sm" style={{ color: 'var(--muted)' }}>
          No free slots found in the next 5 days.
        </p>
      )}

      {schedule && schedule.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Suggested times</p>
          {schedule.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
          <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
            <Calendar size={12} /> Refresh
          </Button>
        </div>
      )}
    </div>
  )
}

function SuggestionCard({ suggestion }: { suggestion: SuggestionType }) {
  let startDate: Date | null = null
  let endDate: Date | null = null
  try { startDate = parseISO(suggestion.startTime); endDate = parseISO(suggestion.endTime) } catch {}

  return (
    <div className="rounded-lg border p-3 space-y-1" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{suggestion.title}</p>
      {startDate && endDate && (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {format(startDate, 'EEE, MMM d')} · {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
        </p>
      )}
      <a
        href={suggestion.calendarLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs"
        style={{ color: 'var(--accent)' }}
      >
        Add to Calendar <ExternalLink size={10} />
      </a>
    </div>
  )
}
