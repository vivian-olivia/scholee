import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: orgs }, { data: tags }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('organisations').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
    supabase.from('tags').select('*').eq('user_id', user.id),
  ])

  if (!profile) redirect('/onboarding')

  return (
    <>
      <TopBar title="Profil" userInitial={profile.name[0]} />
      <main className="flex-1 pb-24">
        <ProfileClient
          profile={profile}
          orgs={orgs ?? []}
          tags={tags ?? []}
          editable
        />
      </main>
    </>
  )
}
