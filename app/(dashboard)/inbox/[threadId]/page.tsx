import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getThreadAction } from '@/actions/gmail'
import { notFound } from 'next/navigation'
import { ThreadViewClient } from './ThreadViewClient'

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const { threadId } = await params
  const data = await getThreadAction(threadId)
  if (!data) notFound()

  return <ThreadViewClient threadId={threadId} initialData={data} />
}
