import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await auth()
  if (session?.user) redirect('/inbox')
  redirect('/signin')
}
