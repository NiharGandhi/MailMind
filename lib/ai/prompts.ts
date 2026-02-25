import type { EmailContext, ScheduleContext, EmailMessage, FreeSlot } from '@/types'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

function formatCalendar(ctx: EmailContext | ScheduleContext): string {
  if (!ctx.calendarEvents.length) return 'No upcoming calendar events.'
  return ctx.calendarEvents.slice(0, 10).map((e) => {
    const tz = ctx.userPreferences.timezone
    const s = toZonedTime(e.startTime, tz)
    const en = toZonedTime(e.endTime, tz)
    return `- ${e.title}: ${format(s, 'EEE MMM d, h:mm a')} – ${format(en, 'h:mm a')}`
  }).join('\n')
}

function formatMessages(messages: EmailMessage[], max = 10): string {
  return messages.slice(-max).map((m) => {
    const from = m.isOutbound ? 'You' : (m.fromName || m.fromEmail)
    return `[${format(m.sentAt, 'MMM d, h:mm a')}] ${from}:\n${m.bodyText ?? m.snippet ?? '(no content)'}`
  }).join('\n\n---\n\n')
}

export function buildReplySystemPrompt(): string {
  return `You are an intelligent email assistant that generates thoughtful, context-aware reply suggestions.

Respond ONLY with valid JSON matching this schema:
{
  "variants": [
    { "tone": "professional", "subject": "string", "body": "string" },
    { "tone": "casual", "body": "string" },
    { "tone": "brief", "body": "string" }
  ],
  "schedulingNotes": "string or null",
  "suggestedMeetingTimes": ["ISO8601"],
  "keyActionItems": ["string"],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative"
}

Guidelines:
- Match the user's writing style
- Keep "brief" variant under 50 words
- Detect action items from thread content
- Assess priority based on urgency and content
- If scheduling intent detected, propose times from calendar context`
}

export function buildReplyUserPrompt(ctx: EmailContext): string {
  const now = toZonedTime(new Date(), ctx.userPreferences.timezone)
  return `<user_context>
Name: ${ctx.userName}
Email: ${ctx.userEmail}
Timezone: ${ctx.userPreferences.timezone}
Current time: ${format(now, "EEEE, MMMM d, yyyy 'at' h:mm a")}
Signature: ${ctx.userPreferences.emailSignature ?? 'None'}
</user_context>

<thread>
Subject: ${ctx.thread.subject}
${formatMessages(ctx.messages)}
</thread>

<calendar>
${formatCalendar(ctx)}
</calendar>

Generate 3 reply variants (professional, casual, brief). Consider calendar for scheduling suggestions.`
}

export function buildSummarySystemPrompt(): string {
  return `Summarize email threads concisely. Use markdown with these sections:
## TL;DR
One sentence.
## Key Points
- Bullet points
## Action Items
- [ ] Tasks (if any)`
}

export function buildSummaryUserPrompt(messages: EmailMessage[], subject: string): string {
  return `Summarize this thread: "${subject}"\n\n${formatMessages(messages, 15)}`
}

export function buildScheduleSystemPrompt(): string {
  return `You are a scheduling assistant. Analyze emails for scheduling intent.

Respond with valid JSON:
{
  "hasSchedulingIntent": boolean,
  "detectedIntent": "string",
  "suggestions": [{
    "startTime": "ISO8601",
    "endTime": "ISO8601",
    "title": "string",
    "description": "string",
    "calendarLink": "https://calendar.google.com/calendar/render?..."
  }]
}`
}

export function buildScheduleUserPrompt(ctx: ScheduleContext, freeSlots: FreeSlot[]): string {
  const tz = ctx.userPreferences.timezone
  const now = toZonedTime(new Date(), tz)
  const slotsText = freeSlots.length
    ? freeSlots.map((s) => {
        const start = toZonedTime(s.start, tz)
        const end = toZonedTime(s.end, tz)
        return `- ${format(start, 'EEE MMM d, h:mm a')} – ${format(end, 'h:mm a')}`
      }).join('\n')
    : 'No free slots available.'

  return `<user_context>
Timezone: ${tz}
Current time: ${format(now, "EEEE, MMMM d, yyyy 'at' h:mm a")}
Working hours: ${ctx.userPreferences.workingHoursStart}:00–${ctx.userPreferences.workingHoursEnd}:00
</user_context>

<thread>
Subject: ${ctx.thread.subject}
${formatMessages(ctx.messages, 5)}
</thread>

<free_slots>
${slotsText}
</free_slots>

Determine if scheduling is needed and suggest meeting times from the free slots.`
}
