export default function InboxLoading() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex w-[320px] shrink-0 flex-col border-r" style={{ borderColor: 'var(--border)' }}>
        <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
          <div className="h-8 animate-pulse rounded-md" style={{ background: 'var(--border)' }} />
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full" style={{ background: 'var(--border)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded" style={{ background: 'var(--border)' }} />
                <div className="h-3 w-full animate-pulse rounded" style={{ background: 'var(--border)' }} />
                <div className="h-2.5 w-1/2 animate-pulse rounded" style={{ background: 'var(--border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    </div>
  )
}
