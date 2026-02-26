import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getStarredThreadsAction } from '@/actions/gmail'
import { MailboxView } from '@/components/email/MailboxView'

export default async function StarredPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const threads = await getStarredThreadsAction(50)

  return (
    <MailboxView
      initialThreads={threads}
      title="Starred"
      emptyIcon="⭐"
      emptyMessage="No starred emails"
      emptySubMessage="Star important emails to find them here quickly"
    />
  )
}
