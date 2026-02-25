import { create } from 'zustand'

type AITab = 'reply' | 'summary' | 'schedule' | 'insights'

interface UIStore {
  sidebarOpen: boolean
  aiPanelOpen: boolean
  activeAITab: AITab
  isStreaming: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
  lastSyncedAt: Date | null
  mobileView: 'list' | 'thread' | 'ai'

  setSidebarOpen: (open: boolean) => void
  setAIPanelOpen: (open: boolean) => void
  setActiveAITab: (tab: AITab) => void
  setIsStreaming: (v: boolean) => void
  setSyncStatus: (s: 'idle' | 'syncing' | 'error') => void
  setLastSyncedAt: (d: Date) => void
  setMobileView: (v: 'list' | 'thread' | 'ai') => void
  toggleSidebar: () => void
  toggleAIPanel: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  aiPanelOpen: false,
  activeAITab: 'reply',
  isStreaming: false,
  syncStatus: 'idle',
  lastSyncedAt: null,
  mobileView: 'list',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
  setActiveAITab: (tab) => set({ activeAITab: tab }),
  setIsStreaming: (v) => set({ isStreaming: v }),
  setSyncStatus: (s) => set({ syncStatus: s }),
  setLastSyncedAt: (d) => set({ lastSyncedAt: d }),
  setMobileView: (v) => set({ mobileView: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
}))
