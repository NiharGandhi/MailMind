import { create } from 'zustand'
import type { EmailThread } from '@/types'

interface ComposeState {
  isOpen: boolean
  to: string
  subject: string
  body: string
  threadId?: string
  inReplyTo?: string
}

interface EmailStore {
  selectedThreadId: string | null
  selectedThread: EmailThread | null
  searchQuery: string
  activeLabel: string
  compose: ComposeState

  setSelectedThread: (id: string | null, thread?: EmailThread | null) => void
  setSearchQuery: (q: string) => void
  setActiveLabel: (label: string) => void
  openCompose: (params?: Partial<Omit<ComposeState, 'isOpen'>>) => void
  closeCompose: () => void
  updateCompose: (updates: Partial<ComposeState>) => void
}

const DEFAULT_COMPOSE: ComposeState = { isOpen: false, to: '', subject: '', body: '' }

export const useEmailStore = create<EmailStore>((set) => ({
  selectedThreadId: null,
  selectedThread: null,
  searchQuery: '',
  activeLabel: 'INBOX',
  compose: DEFAULT_COMPOSE,

  setSelectedThread: (id, thread = null) => set({ selectedThreadId: id, selectedThread: thread }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveLabel: (label) => set({ activeLabel: label, selectedThreadId: null }),
  openCompose: (params = {}) => set({ compose: { ...DEFAULT_COMPOSE, ...params, isOpen: true } }),
  closeCompose: () => set((s) => ({ compose: { ...s.compose, isOpen: false } })),
  updateCompose: (updates) => set((s) => ({ compose: { ...s.compose, ...updates } })),
}))
