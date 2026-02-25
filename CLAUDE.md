# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: MailMind — AI Email Client

MailMind is a full-stack AI-powered email client. Users connect their Google accounts to get intelligent email management: AI-generated replies, calendar-aware scheduling suggestions, and thread summarization with three AI backends (Claude, GPT-4o, Gemini).

---

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations after schema changes
npm run db:migrate   # Apply migrations to Neon DB
npm run db:studio    # Open Drizzle Studio (DB GUI)
```

No test runner is configured.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | NextAuth.js v5 (beta) |
| Email API | Gmail API (googleapis) |
| Calendar API | Google Calendar API |
| AI — Primary | Anthropic Claude (`claude-sonnet-4-6`) |
| AI — Secondary | OpenAI GPT-4o |
| AI — Tertiary | Google Gemini 1.5 Pro |
| Styling | Tailwind CSS v4 + CSS variables |
| Client state | Zustand |
| Server state | TanStack Query v5 |

---

## Architecture

### Directory Layout
```
app/
  (auth)/signin/       # Sign-in page (Google OAuth)
  (dashboard)/         # Protected pages (inbox, settings, etc.)
  api/                 # API routes (auth, gmail, calendar, ai)
  providers.tsx        # QueryClientProvider + SessionProvider wrapper
components/
  email/               # ThreadList, MessageBubble
  ai/                  # AIPanel, ReplyComposer, ThreadSummary, ScheduleSuggestion, ModelSelector
  layout/              # Sidebar
  ui/                  # Primitive components (Button, Badge)
lib/
  db/                  # Drizzle schema + client (schema.ts, index.ts)
  auth/                # NextAuth config (config.ts)
  gmail/               # Gmail API wrapper (client.ts), sync engine (sync.ts), parser (parser.ts)
  calendar/            # Google Calendar wrapper (client.ts), sync (sync.ts)
  ai/                  # AI providers (claude.ts, openai.ts, gemini.ts), prompts (prompts.ts), context builder (context-builder.ts), provider abstraction (providers.ts)
  utils/               # date.ts, email-parser.ts, utils.ts (cn helper)
actions/               # Server Actions: gmail.ts, preferences.ts
hooks/                 # useAIStream.ts, useSync.ts
stores/                # emailStore.ts, uiStore.ts, aiStore.ts
types/                 # index.ts — all shared TypeScript types
```

### Key Architectural Patterns

**Three-panel layout**: Sidebar (240px) → Thread list (320px) → Thread view (flex-1) → AI panel (380px, togglable).

**Sync strategy**: Full sync on first connect (last 100 threads via Gmail API, historyId stored in `sync_state`). Incremental sync using `historyId` thereafter. `useSync` hook polls every 5 minutes.

**AI abstraction**: All AI providers implement the same interface (`lib/ai/providers.ts`). Never call Anthropic/OpenAI/Gemini SDKs directly from components or API routes — always use `getAIProvider(userId)`. Context is assembled by `lib/ai/context-builder.ts` (thread + messages + calendar events + user prefs).

**Streaming**: `/api/ai/stream` uses a `ReadableStream` that iterates `provider.streamReply()` (an `AsyncGenerator<string>`). On the client, `useAIStream` hook reads the stream with `response.body.getReader()`.

**Auth**: Session available via `auth()` from `lib/auth/config.ts` — works in Server Components, API routes, and Server Actions. Google OAuth tokens (access + refresh) live in the `accounts` table.

**Token refresh**: `getOAuth2Client()` in `lib/gmail/client.ts` and `lib/calendar/client.ts` sets up an `oauth2.on('tokens', ...)` listener that auto-persists refreshed tokens to the DB.

**AI result caching**: `stores/aiStore.ts` holds a `cache: Record<threadId, ThreadAICache>` that persists reply results, tone selection, edited body, summary, and schedule suggestions across tab switches and thread changes. `ReplyComposer`, `ThreadSummary`, and `ScheduleSuggestion` all read from and write to this store — never use local `useState` for AI results.

---

## Database

### Key Tables
- `users` — app users
- `accounts` — NextAuth OAuth tokens (Google access/refresh tokens here)
- `email_threads` — cached Gmail threads (with JSONB for participants, labels)
- `email_messages` — individual messages (body stored as HTML + text)
- `calendar_events` — synced Google Calendar events
- `ai_suggestions` — every AI generation logged here (for analytics)
- `user_preferences` — per-user settings (AI model, working hours, timezone)
- `sync_state` — tracks `gmailHistoryId` and last sync timestamp per user

Always run `npm run db:generate` then `npm run db:migrate` after changing `lib/db/schema.ts`. Never edit existing migration files.

---

## Environment Variables

```bash
DATABASE_URL=postgresql://...       # Neon connection string
NEXTAUTH_SECRET=                    # Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Google Cloud setup: Enable Gmail API + Google Calendar API, create OAuth 2.0 credentials, add redirect URI `http://localhost:3000/api/auth/callback/google`, add scopes `gmail.modify`, `gmail.send`, `calendar.readonly`.

---

## Gotchas

1. **Gmail base64url**: Gmail encodes message bodies in base64url (not standard base64). Use `lib/utils/email-parser.ts#decodeBase64Url`.

2. **NextAuth in App Router**: Use `auth()` (not `getServerSession`). The `auth()` function works in Server Components, API Routes, and Server Actions.

3. **Streaming routes**: Must have `export const dynamic = 'force-dynamic'`. Do not mark streaming routes as static.

4. **Tailwind v4 theming**: CSS uses `@import "tailwindcss"` (not `@tailwind` directives). All theme tokens are defined in `globals.css` — first as CSS custom properties in `:root`, then mapped in `@theme inline` so Tailwind utility classes work (`bg-accent`, `text-muted`, `hover:bg-accent-hover`, etc.). No `tailwind.config.ts` exists. The Inter font from `next/font` is exposed as `--font-inter` and wired into `@theme inline` via `--font-sans: var(--font-inter), ...`. When adding new design tokens, add them in both `:root` and `@theme inline`.

5. **Path alias**: `@/*` maps to the repo root.

6. **AI prompts**: All prompts in `lib/ai/prompts.ts`. Use XML tags for Claude prompts. Always inject `timezone` and current datetime. Output format is always explicit JSON.
