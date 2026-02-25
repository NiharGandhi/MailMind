import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getThreadsAction } from '@/actions/gmail'
import { InboxClient } from './InboxClient'

export default async function InboxPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const threads = await getThreadsAction(50)

  return <InboxClient initialThreads={threads} />
}
