'use client'

import { useState, useEffect } from 'react'
import { TbBookmarkOff } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { getDeadlineUrgency } from '@/lib/utils'
import type { Scholarship } from '@/lib/types'

const urgencyOrder = { urgent: 0, soon: 1, ok: 2, expired: 3 }

export default function SavedPage() {
  const [saved, setSaved] = useState<Scholarship[]>([])
  const [userId, setUserId] = useState<string>()
  const [userInitial, setUserInitial] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      setUserId(user.id)

      const [{ data: savedRows }, { data: profile }] = await Promise.all([
        supabase
          .from('saved_scholarships')
          .select('scholarship_id, scholarships(*)')
          .eq('user_id', user.id),
        supabase.from('profiles').select('name').eq('id', user.id).single(),
      ])

      if (profile?.name) setUserInitial(profile.name[0])

      const scholarships = (savedRows ?? [])
        .map((r: { scholarship_id: string; scholarships: unknown }) => r.scholarships as Scholarship)
        .filter(Boolean)
        .sort((a, b) => {
          const ao = urgencyOrder[getDeadlineUrgency(a.deadline)]
          const bo = urgencyOrder[getDeadlineUrgency(b.deadline)]
          if (ao !== bo) return ao - bo
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })

      setSaved(scholarships)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <TopBar title="Tersimpan" userInitial={userInitial} />

      <main className="flex-1 flex flex-col pb-24">
        {loading ? (
          <div className="flex flex-col gap-3 px-4 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-surface-2 border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-24">
            <TbBookmarkOff size={40} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold text-text-primary mb-1">Belum ada beasiswa tersimpan</p>
            <p className="text-xs text-text-muted">Simpan beasiswa dari halaman Jelajahi agar tidak ketinggalan deadline.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 pt-4">
            <p className="text-xs text-text-muted">{saved.length} beasiswa disimpan</p>
            {saved.map(s => (
              <SavedCardWithBorder key={s.id} scholarship={s} userId={userId} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

const urgencyBorderColor = {
  urgent: 'border-l-urgent',
  soon: 'border-l-warning',
  ok: 'border-l-success',
  expired: 'border-l-border',
}

function SavedCardWithBorder({ scholarship, userId }: { scholarship: Scholarship; userId?: string }) {
  const urgency = getDeadlineUrgency(scholarship.deadline)
  return (
    <div className={`border-l-4 rounded-2xl ${urgencyBorderColor[urgency]}`}>
      <ScholarshipCard scholarship={scholarship} initialSaved userId={userId} />
    </div>
  )
}
