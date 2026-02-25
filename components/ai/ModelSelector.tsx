'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPreferencesAction, updatePreferencesAction } from '@/actions/preferences'
import type { AIModel } from '@/types'
import { ChevronDown } from 'lucide-react'

const MODEL_LABELS: Record<AIModel, string> = {
  claude: 'Claude',
  openai: 'GPT-4o',
  gemini: 'Gemini',
}

export function ModelSelector() {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: prefs } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => getPreferencesAction(),
  })

  const { mutate } = useMutation({
    mutationFn: (model: AIModel) => updatePreferencesAction({ preferredAiModel: model }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
  })

  const current = prefs?.preferredAiModel ?? 'claude'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-white/5"
        style={{ color: 'var(--muted)' }}
      >
        {MODEL_LABELS[current]}
        <ChevronDown size={11} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-7 z-50 min-w-[110px] rounded-lg border py-1 shadow-xl"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {(Object.entries(MODEL_LABELS) as [AIModel, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => { mutate(id); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-white/5"
              style={{ color: current === id ? 'var(--accent)' : 'var(--text)' }}
            >
              {label}
              {current === id && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
