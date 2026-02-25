import type { AIModel, EmailContext, ScheduleContext, ReplyResult, ScheduleSuggestion, EmailMessage } from '@/types'
import { db } from '@/lib/db'
import { userPreferences, aiSuggestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface AIProvider {
  modelId: AIModel
  generateReply(ctx: EmailContext): Promise<{ result: ReplyResult; promptTokens: number; completionTokens: number }>
  summarizeThread(messages: EmailMessage[], subject: string): Promise<{ summary: string; promptTokens: number; completionTokens: number }>
  suggestSchedule(ctx: ScheduleContext): Promise<{ suggestions: ScheduleSuggestion[]; promptTokens: number; completionTokens: number }>
  streamReply(ctx: EmailContext): AsyncGenerator<string>
}

export async function getAIProvider(userId: string): Promise<AIProvider> {
  const prefs = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) })
  return getProviderByModel(prefs?.preferredAiModel ?? 'claude')
}

export function getProviderByModel(model: AIModel): AIProvider {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const impl = require(`@/lib/ai/${model === 'openai' ? 'openai' : model === 'gemini' ? 'gemini' : 'claude'}`)
  return { ...impl, modelId: model }
}

export async function logSuggestion(params: {
  userId: string
  threadId?: string
  suggestionType: 'reply' | 'schedule' | 'summary'
  modelUsed: AIModel
  promptTokens: number
  completionTokens: number
  content: unknown
}) {
  await db.insert(aiSuggestions).values({
    userId: params.userId,
    threadId: params.threadId ?? null,
    suggestionType: params.suggestionType,
    modelUsed: params.modelUsed,
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    suggestionContent: params.content as Record<string, unknown>,
  })
}
