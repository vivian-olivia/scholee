'use client'

import { useState, useEffect, useMemo } from 'react'
import { TbSearch } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import type { Scholarship } from '@/lib/types'

type FundingFilter = 'all' | 'full' | 'partial'
type LevelFilter = 'all' | 'highschool' | 's1' | 's2' | 's3'

const LEVEL_LABELS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'highschool', label: 'SMA' },
  { value: 's1', label: 'S1' },
  { value: 's2', label: 'S2' },
  { value: 's3', label: 'S3' },
]

const FUNDING_LABELS: { value: FundingFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'full', label: 'Beasiswa Penuh' },
  { value: 'partial', label: 'Beasiswa Parsial' },
]

export default function ExplorePage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string>()
  const [userInitial, setUserInitial] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>('all')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: { user } }, { data: schols }, ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('scholarships').select('*').eq('status', 'active').order('is_featured', { ascending: false }).order('deadline', { ascending: true }),
      ])

      setScholarships(schols ?? [])

      if (user) {
        setUserId(user.id)
        const { data: saved } = await supabase
          .from('saved_scholarships')
          .select('scholarship_id')
          .eq('user_id', user.id)
        setSavedIds(new Set(saved?.map(s => s.scholarship_id) ?? []))

        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()
        if (profile?.name) setUserInitial(profile.name[0])
      }

      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return scholarships.filter(s => {
      if (fundingFilter !== 'all' && s.funding_type !== fundingFilter) return false
      if (levelFilter !== 'all' && !s.levels.includes(levelFilter)) return false
      if (query) {
        const q = query.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.provider_name.toLowerCase().includes(q)
      }
      return true
    })
  }, [scholarships, fundingFilter, levelFilter, query])

  return (
    <>
      <TopBar userInitial={userInitial} />

      <main className="flex-1 flex flex-col pb-24">
        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2.5">
            <TbSearch size={16} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Cari beasiswa..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm text-text-primary bg-transparent outline-none placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Funding filter */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {FUNDING_LABELS.map(f => (
            <button
              key={f.value}
              onClick={() => setFundingFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                fundingFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 border border-border text-text-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {LEVEL_LABELS.map(l => (
            <button
              key={l.value}
              onClick={() => setLevelFilter(l.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                levelFilter === l.value
                  ? 'bg-primary-dark text-white'
                  : 'bg-surface-2 border border-border text-text-secondary'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col gap-3 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-surface-2 border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-sm font-medium text-text-primary mb-1">Tidak ada beasiswa ditemukan</p>
            <p className="text-xs text-text-muted">Coba ubah filter atau kata kunci pencarianmu</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4">
            <p className="text-xs text-text-muted">{filtered.length} beasiswa ditemukan</p>
            {filtered.map(s => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                initialSaved={savedIds.has(s.id)}
                userId={userId}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
