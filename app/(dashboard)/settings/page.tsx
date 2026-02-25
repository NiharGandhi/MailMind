import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getPreferencesAction } from '@/actions/preferences'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const prefs = await getPreferencesAction()
  return <SettingsClient initialPrefs={prefs} user={session.user} />
}
