import Anthropic from '@anthropic-ai/sdk'
import type { EmailContext, ScheduleContext, ReplyResult, ScheduleSuggestion, EmailMessage } from '@/types'
import { buildReplySystemPrompt, buildReplyUserPrompt, buildSummarySystemPrompt, buildSummaryUserPrompt, buildScheduleSystemPrompt, buildScheduleUserPrompt } from './prompts'
import { findFreeSlots } from '@/lib/calendar/client'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateReply(ctx: EmailContext) {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: buildReplySystemPrompt(),
    messages: [{ role: 'user', content: buildReplyUserPrompt(ctx) }],
  })
  const text = res.content[0].type === 'text' ? res.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Invalid AI response')
  return {
    result: JSON.parse(match[0]) as ReplyResult,
    promptTokens: res.usage.input_tokens,
    completionTokens: res.usage.output_tokens,
  }
}

export async function summarizeThread(messages: EmailMessage[], subject: string) {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: buildSummarySystemPrompt(),
    messages: [{ role: 'user', content: buildSummaryUserPrompt(messages, subject) }],
  })
  const summary = res.content[0].type === 'text' ? res.content[0].text : ''
  return { summary, promptTokens: res.usage.input_tokens, completionTokens: res.usage.output_tokens }
}

export async function suggestSchedule(ctx: ScheduleContext) {
  const freeSlots = await findFreeSlots(ctx.userPreferences.userId, ctx.userPreferences, {
    durationMinutes: ctx.durationMinutes ?? 60,
    daysAhead: 5,
  }).catch(() => [])

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: buildScheduleSystemPrompt(),
    messages: [{ role: 'user', content: buildScheduleUserPrompt(ctx, freeSlots) }],
  })
  const text = res.content[0].type === 'text' ? res.content[0].text : ''
  const match = text.match(/\{[\s\S]*\}/)
  const parsed = match ? JSON.parse(match[0]) : {}
  return { suggestions: (parsed.suggestions ?? []) as ScheduleSuggestion[], promptTokens: res.usage.input_tokens, completionTokens: res.usage.output_tokens }
}

export async function* streamReply(ctx: EmailContext): AsyncGenerator<string> {
  const stream = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: buildReplySystemPrompt(),
    messages: [{ role: 'user', content: buildReplyUserPrompt(ctx) }],
    stream: true,
  })
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
