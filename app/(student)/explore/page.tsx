'use client'

import { useState, useEffect, useMemo } from 'react'
import { TbSearch } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import type { Scholarship, ProviderType } from '@/lib/types'

type FundingFilter = 'all' | 'full' | 'partial'
type LevelFilter = 'all' | 'highschool' | 's1' | 's2' | 's3'
type ProviderFilter = 'all' | ProviderType
type CountryFilter = 'all' | 'domestic' | 'abroad'

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

const PROVIDER_LABELS: { value: ProviderFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'organization', label: 'Organisasi' },
  { value: 'university', label: 'Universitas' },
  { value: 'government', label: 'Pemerintah' },
]

const COUNTRY_LABELS: { value: CountryFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'domestic', label: 'Dalam Negeri' },
  { value: 'abroad', label: 'Luar Negeri' },
]

function FilterRow<T extends string>({
  options,
  active,
  onChange,
  activeClass,
}: {
  options: { value: T; label: string }[]
  active: T
  onChange: (v: T) => void
  activeClass: string
}) {
  return (
    <div className="flex gap-2 px-4 py-1.5 overflow-x-auto scrollbar-hide">
      {options.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            active === f.value
              ? activeClass
              : 'bg-surface-2 border border-border text-text-secondary'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default function ExplorePage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string>()
  const [userInitial, setUserInitial] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>('all')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all')
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: { user } }, { data: schols }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('scholarships').select('*').eq('status', 'active')
          .order('is_featured', { ascending: false })
          .order('deadline', { ascending: true }),
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
      if (providerFilter !== 'all' && (s.provider_type ?? 'organization') !== providerFilter) return false
      if (countryFilter === 'domestic' && !s.countries.some(c => c.toLowerCase().includes('indonesia'))) return false
      if (countryFilter === 'abroad' && !s.countries.some(c => !c.toLowerCase().includes('indonesia'))) return false
      if (query) {
        const q = query.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.provider_name.toLowerCase().includes(q)
      }
      return true
    })
  }, [scholarships, fundingFilter, levelFilter, providerFilter, countryFilter, query])

  const activeFilterCount = [
    fundingFilter !== 'all',
    levelFilter !== 'all',
    providerFilter !== 'all',
    countryFilter !== 'all',
  ].filter(Boolean).length

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

        {/* Filters */}
        <div className="flex flex-col gap-0.5 pb-2">
          <FilterRow
            options={FUNDING_LABELS}
            active={fundingFilter}
            onChange={setFundingFilter}
            activeClass="bg-primary text-white"
          />
          <FilterRow
            options={LEVEL_LABELS}
            active={levelFilter}
            onChange={setLevelFilter}
            activeClass="bg-primary-dark text-white"
          />
          <FilterRow
            options={PROVIDER_LABELS}
            active={providerFilter}
            onChange={setProviderFilter}
            activeClass="bg-accent text-white"
          />
          <FilterRow
            options={COUNTRY_LABELS}
            active={countryFilter}
            onChange={setCountryFilter}
            activeClass="bg-text-secondary text-white"
          />
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
            <p className="text-xs text-text-muted">
              {activeFilterCount > 0
                ? 'Coba ubah atau reset filter yang aktif'
                : 'Coba ubah kata kunci pencarian'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setFundingFilter('all')
                  setLevelFilter('all')
                  setProviderFilter('all')
                  setCountryFilter('all')
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-primary border border-primary-tint rounded-xl"
              >
                Reset Semua Filter
              </button>
            )}
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
