import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar user={session.user} />
      <main className="flex flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
