'use client'

import { useState } from 'react'
import { updatePreferencesAction } from '@/actions/preferences'
import { Button } from '@/components/ui/button'
import type { AIModel } from '@/types'

const AI_MODELS = [
  { id: 'claude' as AIModel, name: 'Claude', desc: 'Best for nuanced, long-form replies' },
  { id: 'openai' as AIModel, name: 'GPT-4o', desc: 'Fast, great for concise replies' },
  { id: 'gemini' as AIModel, name: 'Gemini', desc: 'Strong Google Workspace context' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface SettingsClientProps {
  initialPrefs: {
    preferredAiModel: AIModel
    emailSignature: string | null
    timezone: string
    workingHoursStart: number
    workingHoursEnd: number
    workingDays: number[]
    autoSuggestEnabled: boolean
  } | null
  user: { name?: string | null; email?: string | null }
}

export function SettingsClient({ initialPrefs, user }: SettingsClientProps) {
  const [model, setModel] = useState<AIModel>(initialPrefs?.preferredAiModel ?? 'claude')
  const [signature, setSignature] = useState(initialPrefs?.emailSignature ?? '' as string)
  const [timezone, setTimezone] = useState(initialPrefs?.timezone ?? 'UTC')
  const [hoursStart, setHoursStart] = useState(initialPrefs?.workingHoursStart ?? 9)
  const [hoursEnd, setHoursEnd] = useState(initialPrefs?.workingHoursEnd ?? 17)
  const [workingDays, setWorkingDays] = useState<number[]>(initialPrefs?.workingDays ?? [1, 2, 3, 4, 5])
  const [autoSuggest, setAutoSuggest] = useState(initialPrefs?.autoSuggestEnabled ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleDay(day: number) {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleSave() {
    setSaving(true)
    await updatePreferencesAction({
      preferredAiModel: model,
      emailSignature: signature || null,
      timezone,
      workingHoursStart: hoursStart,
      workingHoursEnd: hoursEnd,
      workingDays,
      autoSuggestEnabled: autoSuggest,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const section = 'mb-6 rounded-xl border p-5 space-y-4'
  const sectionStyle = { background: 'var(--surface)', borderColor: 'var(--border)' }
  const label = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text)' }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold" style={{ color: 'var(--text)' }}>Settings</h1>

        {/* Account */}
        <div className={section} style={sectionStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Account</h2>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{user.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{user.email}</p>
          </div>
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#22c55e30', background: '#22c55e10', color: '#4ade80' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Google account connected
          </div>
        </div>

        {/* AI Model */}
        <div className={section} style={sectionStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>AI Model</h2>
          <div className="space-y-2">
            {AI_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors"
                style={{
                  borderColor: model === m.id ? 'var(--accent)' : 'var(--border)',
                  background: model === m.id ? 'var(--accent)' + '10' : 'transparent',
                }}
              >
                <div
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: model === m.id ? 'var(--accent)' : 'var(--border)' }}
                >
                  {model === m.id && <div className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{m.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Signature */}
        <div className={section} style={sectionStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Email Signature</h2>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={4}
            placeholder="Your signature..."
            className="w-full rounded-lg border bg-transparent p-3 text-sm resize-none focus:outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Working Hours */}
        <div className={section} style={sectionStyle}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Working Hours</h2>

          <div>
            <label className={label} style={labelStyle}>Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--background)' }}
            >
              {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} style={labelStyle}>Start hour</label>
              <input
                type="number" min={0} max={23} value={hoursStart}
                onChange={(e) => setHoursStart(parseInt(e.target.value))}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className={label} style={labelStyle}>End hour</label>
              <input
                type="number" min={0} max={23} value={hoursEnd}
                onChange={(e) => setHoursEnd(parseInt(e.target.value))}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div>
            <label className={label} style={labelStyle}>Working days</label>
            <div className="flex gap-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className="h-8 w-8 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: workingDays.includes(i) ? 'var(--accent)' : 'var(--border)',
                    color: workingDays.includes(i) ? 'white' : 'var(--muted)',
                  }}
                >
                  {day.slice(0, 1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-suggest */}
        <div className={section} style={sectionStyle}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Auto-suggest replies</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Automatically generate reply suggestions when opening a thread</p>
            </div>
            <button
              onClick={() => setAutoSuggest(!autoSuggest)}
              className="relative h-5 w-9 rounded-full transition-colors"
              style={{ background: autoSuggest ? 'var(--accent)' : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{ transform: autoSuggest ? 'translateX(16px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
