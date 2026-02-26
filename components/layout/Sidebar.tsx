'use client'

import { useEmailStore } from '@/stores/emailStore'
import { useUIStore } from '@/stores/uiStore'
import { useSync } from '@/hooks/useSync'
import { signOut } from 'next-auth/react'
import {
  Inbox, Star, Send, Calendar, Settings, RefreshCw,
  PenSquare, ChevronLeft, CheckCircle, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/utils/date'

const NAV_ITEMS = [
  { href: '/inbox', label: 'Inbox', icon: Inbox, labelId: 'INBOX' },
  { href: '/starred', label: 'Starred', icon: Star, labelId: 'STARRED' },
  { href: '/sent', label: 'Sent', icon: Send, labelId: 'SENT' },
  { href: '/calendar', label: 'Calendar', icon: Calendar, labelId: 'CALENDAR' },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function Sidebar({ user }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, syncStatus, lastSyncedAt } = useUIStore()
  const { openCompose } = useEmailStore()
  const { triggerSync } = useSync()
  const pathname = usePathname()

  return (
    <aside
      className={cn('flex h-full flex-col border-r transition-all duration-200', sidebarOpen ? 'w-[240px]' : 'w-[56px]')}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Top */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'var(--accent)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-5 9 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>MailMind</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded p-1 transition-colors hover:bg-white/5 ml-auto"
        >
          <ChevronLeft
            size={14}
            style={{ color: 'var(--muted)', transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }}
          />
        </button>
      </div>

      {/* Compose */}
      <div className="p-2">
        <button
          onClick={() => openCompose()}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            sidebarOpen ? '' : 'justify-center'
          )}
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <PenSquare size={14} />
          {sidebarOpen && 'Compose'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                sidebarOpen ? '' : 'justify-center',
                active ? '' : 'hover:bg-white/5'
              )}
              style={{
                background: active ? 'var(--accent)' + '20' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              <Icon size={15} />
              {sidebarOpen && label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-2 space-y-1" style={{ borderColor: 'var(--border)' }}>
        {/* Sync status */}
        <button
          onClick={() => triggerSync()}
          className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-xs w-full transition-colors hover:bg-white/5', !sidebarOpen && 'justify-center')}
          style={{ color: 'var(--muted)' }}
          title="Sync"
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw size={13} className="animate-spin" style={{ color: 'var(--accent)' }} />
          ) : syncStatus === 'error' ? (
            <AlertCircle size={13} className="text-red-400" />
          ) : (
            <CheckCircle size={13} />
          )}
          {sidebarOpen && (
            <span>
              {syncStatus === 'syncing' ? 'Syncing...' : lastSyncedAt ? `Synced ${formatRelative(lastSyncedAt)}` : 'Not synced'}
            </span>
          )}
        </button>

        <Link
          href="/settings"
          className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5', !sidebarOpen && 'justify-center')}
          style={{ color: 'var(--muted)' }}
        >
          <Settings size={15} />
          {sidebarOpen && 'Settings'}
        </Link>

        {/* User */}
        {sidebarOpen && (
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
          >
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
              style={{ background: 'var(--border)', color: 'var(--text)' }}
            >
              {(user.name ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" style={{ color: 'var(--text)' }}>{user.name}</p>
              <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{user.email}</p>
            </div>
          </button>
        )}
      </div>
    </aside>
  )
}
