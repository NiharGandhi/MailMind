import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'
import type { EmailParticipant, EmailAttachment, EventAttendee, AIModel, SuggestionType, SyncStatus } from '@/types'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
])

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
])

export const emailThreads = pgTable('email_threads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  gmailThreadId: text('gmail_thread_id').notNull(),
  subject: text('subject').notNull().default('(no subject)'),
  snippet: text('snippet'),
  lastMessageAt: timestamp('last_message_at', { mode: 'date' }).notNull().defaultNow(),
  isRead: boolean('is_read').notNull().default(false),
  isStarred: boolean('is_starred').notNull().default(false),
  labels: jsonb('labels').$type<string[]>().notNull().default([]),
  participants: jsonb('participants').$type<EmailParticipant[]>().notNull().default([]),
  messageCount: integer('message_count').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const emailMessages = pgTable('email_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  threadId: text('thread_id').notNull().references(() => emailThreads.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  gmailMessageId: text('gmail_message_id').notNull(),
  fromEmail: text('from_email').notNull(),
  fromName: text('from_name'),
  toRecipients: jsonb('to_recipients').$type<EmailParticipant[]>().notNull().default([]),
  ccRecipients: jsonb('cc_recipients').$type<EmailParticipant[]>().notNull().default([]),
  bodyHtml: text('body_html'),
  bodyText: text('body_text'),
  snippet: text('snippet'),
  sentAt: timestamp('sent_at', { mode: 'date' }).notNull(),
  isOutbound: boolean('is_outbound').notNull().default(false),
  attachments: jsonb('attachments').$type<EmailAttachment[]>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const calendarEvents = pgTable('calendar_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  googleEventId: text('google_event_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }).notNull(),
  location: text('location'),
  attendees: jsonb('attendees').$type<EventAttendee[]>().notNull().default([]),
  isAllDay: boolean('is_all_day').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const aiSuggestions = pgTable('ai_suggestions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').references(() => emailThreads.id, { onDelete: 'set null' }),
  suggestionType: text('suggestion_type').$type<SuggestionType>().notNull(),
  modelUsed: text('model_used').$type<AIModel>().notNull(),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  suggestionContent: jsonb('suggestion_content').notNull(),
  wasUsed: boolean('was_used').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  preferredAiModel: text('preferred_ai_model').$type<AIModel>().notNull().default('claude'),
  emailSignature: text('email_signature'),
  timezone: text('timezone').notNull().default('UTC'),
  workingHoursStart: integer('working_hours_start').notNull().default(9),
  workingHoursEnd: integer('working_hours_end').notNull().default(17),
  workingDays: jsonb('working_days').$type<number[]>().notNull().default([1, 2, 3, 4, 5]),
  autoSuggestEnabled: boolean('auto_suggest_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

export const syncState = pgTable('sync_state', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  lastGmailSync: timestamp('last_gmail_sync', { mode: 'date' }),
  lastCalendarSync: timestamp('last_calendar_sync', { mode: 'date' }),
  gmailHistoryId: text('gmail_history_id'),
  syncStatus: text('sync_status').$type<SyncStatus>().notNull().default('idle'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})
