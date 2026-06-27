'use client'

import { useState } from 'react'
import { TbX } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import type { Scholarship, FundingType, ScholarshipStatus } from '@/lib/types'

const LEVELS = ['highschool', 's1', 's2', 's3', 'gap']
const LEVEL_LABELS: Record<string, string> = { highschool: 'SMA', s1: 'S1', s2: 'S2', s3: 'S3', gap: 'Gap Year' }

type FormState = {
  title: string; provider_name: string; amount: string; living_allowance: string
  funding_type: FundingType; levels: string[]; countries: string; deadline: string
  duration: string; requirements: string; description: string; apply_url: string
  is_featured: boolean; status: ScholarshipStatus
}

const empty: FormState = {
  title: '', provider_name: '', amount: '', living_allowance: '', funding_type: 'full',
  levels: [], countries: '', deadline: '', duration: '', requirements: '', description: '',
  apply_url: '', is_featured: false, status: 'active',
}

function toForm(s: Scholarship): FormState {
  return {
    title: s.title, provider_name: s.provider_name, amount: s.amount ?? '',
    living_allowance: s.living_allowance ?? '', funding_type: s.funding_type,
    levels: s.levels, countries: s.countries.join(', '), deadline: s.deadline,
    duration: s.duration ?? '', requirements: s.requirements?.join('\n') ?? '',
    description: s.description ?? '', apply_url: s.apply_url,
    is_featured: s.is_featured, status: s.status,
  }
}

interface Props {
  editing?: Scholarship
  onClose: () => void
  onSaved: (s: Scholarship) => void
}

export function CmsForm({ editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(editing ? toForm(editing) : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof FormState, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleLevel(l: string) {
    set('levels', form.levels.includes(l) ? form.levels.filter(x => x !== l) : [...form.levels, l])
  }

  async function save() {
    if (!form.title || !form.provider_name || !form.deadline || !form.apply_url) {
      return setError('Judul, provider, deadline, dan URL wajib diisi.')
    }
    setSaving(true); setError('')
    const payload = {
      title: form.title, provider_name: form.provider_name,
      amount: form.amount || null, living_allowance: form.living_allowance || null,
      funding_type: form.funding_type, levels: form.levels,
      countries: form.countries.split(',').map(c => c.trim()).filter(Boolean),
      deadline: form.deadline, duration: form.duration || null,
      requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : null,
      description: form.description || null, apply_url: form.apply_url,
      is_featured: form.is_featured, status: form.status,
    }
    const supabase = createClient()
    let data: Scholarship | null = null
    if (editing) {
      const res = await supabase.from('scholarships').update(payload).eq('id', editing.id).select().single()
      if (res.error) { setError('Gagal menyimpan.'); setSaving(false); return }
      data = res.data
    } else {
      const res = await supabase.from('scholarships').insert(payload).select().single()
      if (res.error) { setError('Gagal menyimpan.'); setSaving(false); return }
      data = res.data
    }
    onSaved(data!)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-surface-0 rounded-2xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">{editing ? 'Edit Beasiswa' : 'Tambah Beasiswa'}</h2>
          <button onClick={onClose}><TbX size={20} className="text-text-muted" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {error && <p className="col-span-2 text-xs text-urgent bg-urgent-surface rounded-lg px-3 py-2">{error}</p>}
          <F label="Judul *"><input value={form.title} onChange={e => set('title', e.target.value)} className="input-base" /></F>
          <F label="Provider *"><input value={form.provider_name} onChange={e => set('provider_name', e.target.value)} className="input-base" /></F>
          <F label="Nilai Beasiswa"><input value={form.amount} onChange={e => set('amount', e.target.value)} className="input-base" /></F>
          <F label="Tunjangan Hidup"><input value={form.living_allowance} onChange={e => set('living_allowance', e.target.value)} className="input-base" /></F>
          <F label="Deadline *"><input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="input-base" /></F>
          <F label="Durasi"><input value={form.duration} onChange={e => set('duration', e.target.value)} className="input-base" /></F>
          <F label="Negara (pisah koma)"><input value={form.countries} onChange={e => set('countries', e.target.value)} className="input-base" placeholder="Indonesia, Luar Negeri" /></F>
          <F label="URL Pendaftaran *"><input value={form.apply_url} onChange={e => set('apply_url', e.target.value)} className="input-base" /></F>
          <F label="Tipe Pendanaan">
            <select value={form.funding_type} onChange={e => set('funding_type', e.target.value as FundingType)} className="input-base">
              <option value="full">Beasiswa Penuh</option>
              <option value="partial">Beasiswa Parsial</option>
            </select>
          </F>
          <F label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value as ScholarshipStatus)} className="input-base">
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
              <option value="closed">Ditutup</option>
            </select>
          </F>
          <F label="Jenjang" className="col-span-2">
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(l => (
                <button key={l} type="button" onClick={() => toggleLevel(l)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${form.levels.includes(l) ? 'bg-primary text-white border-primary' : 'bg-surface-2 border-border text-text-secondary'}`}>
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </F>
          <F label="Persyaratan (satu per baris)" className="col-span-2">
            <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={4} className="input-base resize-none" />
          </F>
          <F label="Deskripsi" className="col-span-2">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input-base resize-none" />
          </F>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="accent-primary" />
            <label htmlFor="featured" className="text-sm text-text-secondary">Tandai sebagai Unggulan</label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-text-secondary">Batal</button>
            <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function F({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  )
}
