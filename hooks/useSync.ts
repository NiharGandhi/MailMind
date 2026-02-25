'use client'

import { useCallback, useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useQueryClient } from '@tanstack/react-query'

const SYNC_INTERVAL_MS = 5 * 60 * 1000

export function useSync() {
  const { syncStatus, lastSyncedAt, setSyncStatus, setLastSyncedAt } = useUIStore()
  const queryClient = useQueryClient()

  const triggerSync = useCallback(async (full = false) => {
    if (syncStatus === 'syncing') return
    setSyncStatus('syncing')
    try {
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full }),
      })
      if (res.ok) {
        setSyncStatus('idle')
        setLastSyncedAt(new Date())
        queryClient.invalidateQueries({ queryKey: ['threads'] })
      } else {
        setSyncStatus('error')
      }
    } catch {
      setSyncStatus('error')
    }
  }, [syncStatus, setSyncStatus, setLastSyncedAt, queryClient])

  useEffect(() => {
    const shouldSync = !lastSyncedAt || (Date.now() - lastSyncedAt.getTime() > SYNC_INTERVAL_MS)
    if (shouldSync) triggerSync(false)
    const interval = setInterval(() => triggerSync(false), SYNC_INTERVAL_MS)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { syncStatus, lastSyncedAt, triggerSync }
}
