import { GoogleGenerativeAI } from '@google/generative-ai'
import type { EmailContext, ScheduleContext, ReplyResult, ScheduleSuggestion, EmailMessage } from '@/types'
import { buildReplySystemPrompt, buildReplyUserPrompt, buildSummarySystemPrompt, buildSummaryUserPrompt, buildScheduleSystemPrompt, buildScheduleUserPrompt } from './prompts'
import { findFreeSlots } from '@/lib/calendar/client'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

function model(systemInstruction: string, jsonMode = true) {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction,
    generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
  })
}

export async function generateReply(ctx: EmailContext) {
  const res = await model(buildReplySystemPrompt()).generateContent(buildReplyUserPrompt(ctx))
  return { result: JSON.parse(res.response.text()) as ReplyResult, promptTokens: 0, completionTokens: 0 }
}

export async function summarizeThread(messages: EmailMessage[], subject: string) {
  const res = await model(buildSummarySystemPrompt(), false).generateContent(buildSummaryUserPrompt(messages, subject))
  return { summary: res.response.text(), promptTokens: 0, completionTokens: 0 }
}

export async function suggestSchedule(ctx: ScheduleContext) {
  const freeSlots = await findFreeSlots(ctx.userPreferences.userId, ctx.userPreferences, {
    durationMinutes: ctx.durationMinutes ?? 60, daysAhead: 5,
  }).catch(() => [])

  const res = await model(buildScheduleSystemPrompt()).generateContent(buildScheduleUserPrompt(ctx, freeSlots))
  const parsed = JSON.parse(res.response.text())
  return { suggestions: (parsed.suggestions ?? []) as ScheduleSuggestion[], promptTokens: 0, completionTokens: 0 }
}

export async function* streamReply(ctx: EmailContext): AsyncGenerator<string> {
  const m = model(buildReplySystemPrompt())
  const stream = await m.generateContentStream(buildReplyUserPrompt(ctx))
  for await (const chunk of stream.stream) yield chunk.text()
}
