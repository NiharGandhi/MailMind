import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getSentThreadsAction } from '@/actions/gmail'
import { MailboxView } from '@/components/email/MailboxView'
import type { EmailThread } from '@/types'

export default async function SentPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const threads = (await getSentThreadsAction(50)) as EmailThread[]

  return (
    <MailboxView
      initialThreads={threads}
      title="Sent"
      emptyIcon="📤"
      emptyMessage="No sent emails"
      emptySubMessage="Emails you send will appear here"
    />
  )
}
