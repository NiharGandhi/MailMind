'use server'

import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { userPreferences } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { AIModel } from '@/types'

export async function getPreferencesAction() {
  const session = await auth()
  if (!session?.user?.id) return null

  let prefs = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, session.user.id) })
  if (!prefs) {
    const [created] = await db.insert(userPreferences).values({ userId: session.user.id }).returning()
    prefs = created
  }
  return prefs
}

export async function updatePreferencesAction(updates: {
  preferredAiModel?: AIModel
  emailSignature?: string | null
  timezone?: string
  workingHoursStart?: number
  workingHoursEnd?: number
  workingDays?: number[]
  autoSuggestEnabled?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await db.insert(userPreferences)
    .values({ userId: session.user.id, ...updates })
    .onConflictDoUpdate({ target: userPreferences.userId, set: { ...updates, updatedAt: new Date() } })

  revalidatePath('/settings')
}
