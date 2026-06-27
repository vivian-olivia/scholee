import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TbArrowLeft } from 'react-icons/tb'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: profile }, { data: orgs }, { data: tags }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('organisations').select('*').eq('user_id', id).order('start_date', { ascending: false }),
    supabase.from('tags').select('*').eq('user_id', id),
  ])

  if (!profile) notFound()

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      <header className="flex items-center gap-3 px-4 py-4 bg-surface-0 sticky top-0 z-10 border-b border-border">
        <Link href="/explore" className="p-1 -ml-1 text-text-secondary">
          <TbArrowLeft size={22} />
        </Link>
        <span className="text-sm font-semibold text-text-primary">Profil</span>
      </header>
      <main className="flex-1 pb-8">
        <ProfileClient
          profile={profile}
          orgs={orgs ?? []}
          tags={tags ?? []}
        />
      </main>
    </div>
  )
}
