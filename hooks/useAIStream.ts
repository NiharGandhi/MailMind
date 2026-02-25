'use client'

import { useState, useCallback, useRef } from 'react'
import type { ReplyResult } from '@/types'

interface UseAIStreamOptions {
  onComplete?: (result: ReplyResult | null) => void
  onError?: (error: string) => void
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stream = useCallback(
    async (threadId: string, type: 'reply' | 'summary' | 'schedule' = 'reply') => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setStreamedText('')
      setError(null)
      setIsStreaming(true)

      try {
        const res = await fetch('/api/ai/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId, suggestionType: type }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let full = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value, { stream: true })
          setStreamedText(full)
        }

        const match = full.match(/\{[\s\S]*\}/)
        if (match) {
          try { options.onComplete?.(JSON.parse(match[0]) as ReplyResult) }
          catch { options.onComplete?.(null) }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          setError(msg)
          options.onError?.(msg)
        }
      } finally {
        setIsStreaming(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { streamedText, isStreaming, error, stream, abort }
}
