'use client'

interface StreamingResponseProps {
  text: string
  isStreaming: boolean
}

export function StreamingResponse({ text, isStreaming }: StreamingResponseProps) {
  return (
    <div
      className={`text-sm leading-relaxed whitespace-pre-wrap ${isStreaming ? 'streaming-cursor' : ''}`}
      style={{ color: 'var(--text)' }}
    >
      {text || (
        <span style={{ color: 'var(--muted)' }}>Generating...</span>
      )}
    </div>
  )
}
