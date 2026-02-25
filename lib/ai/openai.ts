import OpenAI from 'openai'
import type { EmailContext, ScheduleContext, ReplyResult, ScheduleSuggestion, EmailMessage } from '@/types'
import { buildReplySystemPrompt, buildReplyUserPrompt, buildSummarySystemPrompt, buildSummaryUserPrompt, buildScheduleSystemPrompt, buildScheduleUserPrompt } from './prompts'
import { findFreeSlots } from '@/lib/calendar/client'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateReply(ctx: EmailContext) {
  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: buildReplySystemPrompt() }, { role: 'user', content: buildReplyUserPrompt(ctx) }],
  })
  return {
    result: JSON.parse(res.choices[0].message.content ?? '{}') as ReplyResult,
    promptTokens: res.usage?.prompt_tokens ?? 0,
    completionTokens: res.usage?.completion_tokens ?? 0,
  }
}

export async function summarizeThread(messages: EmailMessage[], subject: string) {
  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [{ role: 'system', content: buildSummarySystemPrompt() }, { role: 'user', content: buildSummaryUserPrompt(messages, subject) }],
  })
  return {
    summary: res.choices[0].message.content ?? '',
    promptTokens: res.usage?.prompt_tokens ?? 0,
    completionTokens: res.usage?.completion_tokens ?? 0,
  }
}

export async function suggestSchedule(ctx: ScheduleContext) {
  const freeSlots = await findFreeSlots(ctx.userPreferences.userId, ctx.userPreferences, {
    durationMinutes: ctx.durationMinutes ?? 60, daysAhead: 5,
  }).catch(() => [])

  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: buildScheduleSystemPrompt() }, { role: 'user', content: buildScheduleUserPrompt(ctx, freeSlots) }],
  })
  const parsed = JSON.parse(res.choices[0].message.content ?? '{}')
  return {
    suggestions: (parsed.suggestions ?? []) as ScheduleSuggestion[],
    promptTokens: res.usage?.prompt_tokens ?? 0,
    completionTokens: res.usage?.completion_tokens ?? 0,
  }
}

export async function* streamReply(ctx: EmailContext): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    stream: true,
    messages: [{ role: 'system', content: buildReplySystemPrompt() }, { role: 'user', content: buildReplyUserPrompt(ctx) }],
  })
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
