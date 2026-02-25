export type AIModel = 'claude' | 'openai' | 'gemini'
export type SuggestionType = 'reply' | 'schedule' | 'summary'
export type Priority = 'high' | 'medium' | 'low'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type SyncStatus = 'idle' | 'syncing' | 'error'

export interface EmailThread {
  id: string
  userId: string
  gmailThreadId: string
  subject: string
  snippet: string | null
  lastMessageAt: Date
  isRead: boolean
  isStarred: boolean
  labels: string[]
  participants: EmailParticipant[]
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface EmailMessage {
  id: string
  threadId: string
  userId: string
  gmailMessageId: string
  fromEmail: string
  fromName: string | null
  toRecipients: EmailParticipant[]
  ccRecipients: EmailParticipant[]
  bodyHtml: string | null
  bodyText: string | null
  snippet: string | null
  sentAt: Date
  isOutbound: boolean
  attachments: EmailAttachment[]
  createdAt: Date
}

export interface EmailParticipant {
  email: string
  name?: string
}

export interface EmailAttachment {
  filename: string
  mimeType: string
  size: number
  attachmentId: string
}

export interface CalendarEvent {
  id: string
  userId: string
  googleEventId: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  location: string | null
  attendees: EventAttendee[]
  isAllDay: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EventAttendee {
  email: string
  name?: string
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction'
}

export interface UserPreferences {
  id: string
  userId: string
  preferredAiModel: AIModel
  emailSignature: string | null
  timezone: string
  workingHoursStart: number
  workingHoursEnd: number
  workingDays: number[]
  autoSuggestEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ReplyVariant {
  tone: 'professional' | 'casual' | 'brief'
  subject?: string
  body: string
}

export interface ReplyResult {
  variants: ReplyVariant[]
  schedulingNotes: string | null
  suggestedMeetingTimes: string[]
  keyActionItems: string[]
  priority: Priority
  sentiment: Sentiment
}

export interface ScheduleSuggestion {
  startTime: string
  endTime: string
  title: string
  description?: string
  calendarLink: string
}

export interface EmailContext {
  thread: EmailThread
  messages: EmailMessage[]
  calendarEvents: CalendarEvent[]
  userPreferences: UserPreferences
  userEmail: string
  userName: string
}

export interface ScheduleContext {
  thread: EmailThread
  messages: EmailMessage[]
  calendarEvents: CalendarEvent[]
  userPreferences: UserPreferences
  durationMinutes?: number
}

export interface FreeSlot {
  start: Date
  end: Date
}

export interface GmailSyncResult {
  threadsProcessed: number
  messagesProcessed: number
  newHistoryId: string | null
  error?: string
}
