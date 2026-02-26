'use client'

import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
  parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

interface CalendarClientProps {
  events: CalendarEvent[]
}

const EVENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4',
  '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
]

function colorForTitle(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length]
}

export function CalendarClient({ events }: CalendarClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())

  // Build the 6-week grid of days
  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end   = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    const days: Date[] = []
    let cur = start
    while (cur <= end) {
      days.push(cur)
      cur = addDays(cur, 1)
    }
    return days
  }, [currentMonth])

  // Map day-string → events
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const key = format(new Date(ev.startTime), 'yyyy-MM-dd')
      const list = map.get(key) ?? []
      list.push(ev)
      map.set(key, list)
    }
    return map
  }, [events])

  const selectedDayKey = format(selectedDay, 'yyyy-MM-dd')
  const selectedEvents = eventsByDay.get(selectedDayKey) ?? []

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Calendar grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Month nav */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()) }}
              className="rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-white/5"
              style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
              style={{ color: 'var(--muted)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium"
              style={{ color: 'var(--muted)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ gridAutoRows: 'minmax(80px, 1fr)' }}>
          {gridDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay.get(key) ?? []
            const inMonth = isSameMonth(day, currentMonth)
            const selected = isSameDay(day, selectedDay)
            const today = isToday(day)

            return (
              <div
                key={key}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'border-b border-r p-2 cursor-pointer transition-colors overflow-hidden',
                  !inMonth && 'opacity-35',
                  selected && 'ring-1 ring-inset',
                  !selected && 'hover:bg-white/[0.03]'
                )}
                style={{
                  borderColor: 'var(--border)',
                  ...(selected ? { ringColor: 'var(--accent)' } : {}),
                }}
              >
                {/* Day number */}
                <div className="flex justify-end mb-1">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      today && !selected && 'text-white',
                      selected && 'text-white',
                    )}
                    style={{
                      background: selected
                        ? 'var(--accent)'
                        : today
                        ? 'var(--accent-hover)'
                        : 'transparent',
                      color: selected || today ? 'white' : inMonth ? 'var(--text)' : 'var(--muted)',
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Event dots / pills */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight"
                      style={{
                        background: colorForTitle(ev.title) + '28',
                        color: colorForTitle(ev.title),
                      }}
                    >
                      {ev.isAllDay ? ev.title : `${format(new Date(ev.startTime), 'h:mm a')} ${ev.title}`}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="pl-1 text-[10px]" style={{ color: 'var(--muted)' }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event sidebar */}
      <div
        className="w-[300px] shrink-0 border-l flex flex-col overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--muted)' }}>
            {format(selectedDay, 'EEEE')}
          </p>
          <p className="text-2xl font-bold" style={{ color: isToday(selectedDay) ? 'var(--accent)' : 'var(--text)' }}>
            {format(selectedDay, 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No events</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Enjoy your free day!</p>
            </div>
          ) : (
            selectedEvents
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))
          )}
        </div>

        {/* Upcoming events */}
        <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
            Upcoming
          </p>
          <div className="space-y-1.5">
            {events
              .filter((ev) => new Date(ev.startTime) > new Date())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 4)
              .map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-2 rounded-lg p-2 cursor-pointer transition-colors hover:bg-white/5"
                  onClick={() => setSelectedDay(new Date(ev.startTime))}
                >
                  <div
                    className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: colorForTitle(ev.title) }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                      {ev.title}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {format(new Date(ev.startTime), 'EEE, MMM d · h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            {events.filter((ev) => new Date(ev.startTime) > new Date()).length === 0 && (
              <p className="text-xs py-1" style={{ color: 'var(--muted)' }}>No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  const color = colorForTitle(event.title)
  return (
    <div
      className="rounded-lg border p-3 space-y-2 fade-in"
      style={{ borderColor: 'var(--border)', borderLeftColor: color, borderLeftWidth: 3, background: 'var(--surface)' }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{event.title}</p>

      <div className="space-y-1">
        {!event.isAllDay && (
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {format(new Date(event.startTime), 'h:mm a')} – {format(new Date(event.endTime), 'h:mm a')}
            </span>
          </div>
        )}
        {event.isAllDay && (
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>All day</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>{event.location}</span>
          </div>
        )}
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
          {event.description}
        </p>
      )}
    </div>
  )
}
