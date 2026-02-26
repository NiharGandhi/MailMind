import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { accounts, sessions, users, verificationTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/calendar.readonly',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id },
    }),
    signIn: async ({ user, account }) => {
      if (account?.provider === 'google' && user?.id) {
        // Trigger initial Gmail + calendar sync after sign-in (fire-and-forget)
        setTimeout(() => {
          Promise.all([
            fetch(`${process.env.NEXTAUTH_URL}/api/gmail/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, full: true }),
            }),
            fetch(`${process.env.NEXTAUTH_URL}/api/calendar/sync`, { method: 'POST' }),
          ]).catch(() => {})
        }, 2000)
      }
      return true
    },
  },
  pages: { signIn: '/signin' },
  session: { strategy: 'database' },
})

export async function getGoogleTokens(userId: string) {
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, userId),
  })
  if (!account?.access_token) return null
  return {
    accessToken: account.access_token,
    refreshToken: account.refresh_token ?? null,
    expiresAt: account.expires_at ?? null,
  }
}
