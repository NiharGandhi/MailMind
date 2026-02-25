import { create } from 'zustand'
import type { ReplyResult, ScheduleSuggestion } from '@/types'

interface ThreadAICache {
  reply: ReplyResult | null
  selectedTone: 'professional' | 'casual' | 'brief'
  editedBody: string
  summary: string | null
  schedule: ScheduleSuggestion[] | null
  scheduleChecked: boolean
  scheduleHasIntent: boolean
}

const DEFAULT_CACHE: ThreadAICache = {
  reply: null,
  selectedTone: 'professional',
  editedBody: '',
  summary: null,
  schedule: null,
  scheduleChecked: false,
  scheduleHasIntent: false,
}

interface AIStore {
  cache: Record<string, ThreadAICache>
  setReply: (threadId: string, result: ReplyResult) => void
  setSelectedTone: (threadId: string, tone: 'professional' | 'casual' | 'brief') => void
  setEditedBody: (threadId: string, body: string) => void
  setSummary: (threadId: string, summary: string) => void
  setSchedule: (threadId: string, suggestions: ScheduleSuggestion[], hasIntent: boolean) => void
  getCache: (threadId: string) => ThreadAICache
}

export const useAIStore = create<AIStore>((set, get) => ({
  cache: {},

  getCache: (threadId) => get().cache[threadId] ?? DEFAULT_CACHE,

  setReply: (threadId, result) =>
    set((s) => ({
      cache: {
        ...s.cache,
        [threadId]: {
          ...(s.cache[threadId] ?? DEFAULT_CACHE),
          reply: result,
          editedBody:
            result.variants.find((v) => v.tone === (s.cache[threadId]?.selectedTone ?? 'professional'))?.body ??
            result.variants[0]?.body ??
            '',
        },
      },
    })),

  setSelectedTone: (threadId, tone) =>
    set((s) => {
      const current = s.cache[threadId] ?? DEFAULT_CACHE
      const variant = current.reply?.variants.find((v) => v.tone === tone)
      return {
        cache: {
          ...s.cache,
          [threadId]: {
            ...current,
            selectedTone: tone,
            editedBody: variant?.body ?? current.editedBody,
          },
        },
      }
    }),

  setEditedBody: (threadId, body) =>
    set((s) => ({
      cache: {
        ...s.cache,
        [threadId]: { ...(s.cache[threadId] ?? DEFAULT_CACHE), editedBody: body },
      },
    })),

  setSummary: (threadId, summary) =>
    set((s) => ({
      cache: {
        ...s.cache,
        [threadId]: { ...(s.cache[threadId] ?? DEFAULT_CACHE), summary },
      },
    })),

  setSchedule: (threadId, suggestions, hasIntent) =>
    set((s) => ({
      cache: {
        ...s.cache,
        [threadId]: {
          ...(s.cache[threadId] ?? DEFAULT_CACHE),
          schedule: suggestions,
          scheduleChecked: true,
          scheduleHasIntent: hasIntent,
        },
      },
    })),
}))
