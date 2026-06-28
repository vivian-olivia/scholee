'use client'

import { useState, useEffect, useMemo } from 'react'
import { TbSearch, TbAdjustmentsHorizontal, TbX, TbCheck } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import type { Scholarship, ProviderType } from '@/lib/types'

type FundingFilter = 'all' | 'full' | 'partial'
type LevelFilter = 'all' | 'highschool' | 's1' | 's2' | 's3' | 'gap'
type ProviderFilter = 'all' | ProviderType
type SortOption = 'deadline-asc' | 'deadline-desc' | 'newest'

const SORT_LABELS: Record<SortOption, string> = {
  'deadline-asc': 'Deadline Terdekat',
  'deadline-desc': 'Deadline Terjauh',
  'newest': 'Terbaru Ditambah',
}

export default function ExplorePage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string>()
  const [userInitial, setUserInitial] = useState<string>()
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [funding, setFunding] = useState<FundingFilter>('all')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [provider, setProvider] = useState<ProviderFilter>('all')
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('deadline-asc')
  const [showFilter, setShowFilter] = useState(false)

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
        const [{ data: saved }, { data: profile }] = await Promise.all([
          supabase.from('saved_scholarships').select('scholarship_id').eq('user_id', user.id),
          supabase.from('profiles').select('name').eq('id', user.id).single(),
        ])
        setSavedIds(new Set(saved?.map(s => s.scholarship_id) ?? []))
        if (profile?.name) setUserInitial(profile.name[0])
      }
      setLoading(false)
    }
    load()
  }, [])

  const allCountries = useMemo(() => {
    const seen = new Set<string>()
    scholarships.forEach(s => s.countries.forEach(c => seen.add(c)))
    return Array.from(seen).sort()
  }, [scholarships])

  function toggleCountry(c: string) {
    setSelectedCountries(prev => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
  }

  function resetFilters() {
    setFunding('all')
    setLevel('all')
    setProvider('all')
    setSelectedCountries(new Set())
    setSortBy('deadline-asc')
  }

  const activeFilterCount = [
    funding !== 'all',
    level !== 'all',
    provider !== 'all',
    selectedCountries.size > 0,
  ].filter(Boolean).length

  const results = useMemo(() => {
    const filtered = scholarships.filter(s => {
      if (funding !== 'all' && s.funding_type !== funding) return false
      if (level !== 'all' && !s.levels.includes(level)) return false
      if (provider !== 'all' && (s.provider_type ?? 'organization') !== provider) return false
      if (selectedCountries.size > 0 && !s.countries.some(c => selectedCountries.has(c))) return false
      if (query) {
        const q = query.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.provider_name.toLowerCase().includes(q)
      }
      return true
    })

    if (sortBy === 'deadline-asc') return filtered // already sorted by Supabase
    if (sortBy === 'deadline-desc') return [...filtered].sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
    return [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [scholarships, funding, level, provider, selectedCountries, query, sortBy])

  return (
    <>
      <TopBar userInitial={userInitial} />

      <main className="flex-1 flex flex-col pb-24">
        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-2.5">
            <TbSearch size={16} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Cari beasiswa atau provider..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm text-text-primary bg-transparent outline-none placeholder:text-text-muted"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-text-muted">
                <TbX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            onClick={() => setShowFilter(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              activeFilterCount > 0
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-2 border-border text-text-secondary'
            }`}
          >
            <TbAdjustmentsHorizontal size={15} />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="text-xs font-medium text-text-secondary bg-transparent outline-none cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map(k => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="ml-auto text-xs text-text-muted underline underline-offset-2">
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col gap-3 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-surface-2 border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-sm font-medium text-text-primary mb-1">Tidak ada beasiswa ditemukan</p>
            <p className="text-xs text-text-muted mb-4">
              {activeFilterCount > 0 ? 'Coba ubah atau reset filter' : 'Coba kata kunci lain'}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="px-4 py-2 text-xs font-medium text-primary border border-primary-tint rounded-xl">
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4">
            <p className="text-xs text-text-muted">{results.length} beasiswa ditemukan</p>
            {results.map(s => (
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

      {/* Filter sheet */}
      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        allCountries={allCountries}
        funding={funding} setFunding={setFunding}
        level={level} setLevel={setLevel}
        provider={provider} setProvider={setProvider}
        selectedCountries={selectedCountries} toggleCountry={toggleCountry}
        sortBy={sortBy} setSortBy={setSortBy}
        resultCount={results.length}
        onReset={resetFilters}
      />
    </>
  )
}

/* ── Filter bottom sheet ── */

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  allCountries: string[]
  funding: FundingFilter; setFunding: (v: FundingFilter) => void
  level: LevelFilter; setLevel: (v: LevelFilter) => void
  provider: ProviderFilter; setProvider: (v: ProviderFilter) => void
  selectedCountries: Set<string>; toggleCountry: (c: string) => void
  sortBy: SortOption; setSortBy: (v: SortOption) => void
  resultCount: number
  onReset: () => void
}

function FilterSheet({
  open, onClose, allCountries,
  funding, setFunding, level, setLevel, provider, setProvider,
  selectedCountries, toggleCountry, sortBy, setSortBy,
  resultCount, onReset,
}: FilterSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-surface-0 rounded-t-3xl max-h-[85vh] flex flex-col transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-text-primary">Filter & Urutkan</h2>
          <div className="flex items-center gap-3">
            <button onClick={onReset} className="text-xs text-text-muted underline underline-offset-2">Reset</button>
            <button onClick={onClose} className="p-1 text-text-muted"><TbX size={18} /></button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-6">

          {/* Sort */}
          <Section label="Urutkan">
            <div className="flex flex-col gap-2">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([k, label]) => (
                <RadioRow key={k} label={label} checked={sortBy === k} onClick={() => setSortBy(k)} />
              ))}
            </div>
          </Section>

          {/* Pendanaan */}
          <Section label="Tipe Pendanaan">
            <div className="flex gap-2 flex-wrap">
              {([['all', 'Semua'], ['full', 'Beasiswa Penuh'], ['partial', 'Beasiswa Parsial']] as [FundingFilter, string][]).map(([v, label]) => (
                <Chip key={v} label={label} active={funding === v} onClick={() => setFunding(v)} />
              ))}
            </div>
          </Section>

          {/* Jenjang */}
          <Section label="Jenjang Studi">
            <div className="flex gap-2 flex-wrap">
              {([['all', 'Semua'], ['highschool', 'SMA'], ['s1', 'S1'], ['s2', 'S2'], ['s3', 'S3'], ['gap', 'Gap Year']] as [LevelFilter, string][]).map(([v, label]) => (
                <Chip key={v} label={label} active={level === v} onClick={() => setLevel(v)} />
              ))}
            </div>
          </Section>

          {/* Sumber */}
          <Section label="Sumber Beasiswa">
            <div className="flex gap-2 flex-wrap">
              {([['all', 'Semua'], ['organization', 'Organisasi'], ['university', 'Universitas'], ['government', 'Pemerintah']] as [ProviderFilter, string][]).map(([v, label]) => (
                <Chip key={v} label={label} active={provider === v} onClick={() => setProvider(v)} />
              ))}
            </div>
          </Section>

          {/* Negara Tujuan */}
          {allCountries.length > 0 && (
            <Section label="Negara Tujuan">
              <div className="flex flex-col gap-0">
                {allCountries.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCountry(c)}
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  >
                    <span className={`text-sm ${selectedCountries.has(c) ? 'text-primary font-medium' : 'text-text-primary'}`}>{c}</span>
                    {selectedCountries.has(c) && <TbCheck size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Apply button */}
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-primary text-white text-sm font-semibold rounded-2xl"
          >
            Tampilkan {resultCount} Beasiswa
          </button>
        </div>
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">{label}</p>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
        active ? 'bg-primary text-white border-primary' : 'bg-surface-2 border-border text-text-secondary'
      }`}
    >
      {label}
    </button>
  )
}

function RadioRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between py-1">
      <span className={`text-sm ${checked ? 'text-primary font-medium' : 'text-text-primary'}`}>{label}</span>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-primary' : 'border-border'}`}>
        {checked && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
    </button>
  )
}
