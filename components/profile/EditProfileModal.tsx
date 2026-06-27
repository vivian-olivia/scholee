'use client'

import { useState } from 'react'
import { TbX } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import type { Profile, StudyLevel } from '@/lib/types'

const STUDY_LEVELS: { value: StudyLevel; label: string }[] = [
  { value: 'highschool', label: 'SMA' },
  { value: 's1', label: 'S1' },
  { value: 's2', label: 'S2' },
  { value: 's3', label: 'S3' },
  { value: 'gap', label: 'Gap Year' },
]

interface Props {
  profile: Profile
  onClose: () => void
  onSaved: (updated: Profile) => void
}

export function EditProfileModal({ profile, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: profile.name,
    study_level: profile.study_level,
    university: profile.university ?? '',
    field: profile.field ?? '',
    gpa: profile.gpa?.toString() ?? '',
    bio: profile.bio ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    if (!form.name.trim()) return setError('Nama tidak boleh kosong.')
    setSaving(true)
    setError('')
    const supabase = createClient()
    const updates = {
      name: form.name.trim(),
      study_level: form.study_level,
      university: form.university || null,
      field: form.field || null,
      gpa: form.gpa ? parseFloat(form.gpa) : null,
      bio: form.bio || null,
    }
    const { error: err } = await supabase.from('profiles').update(updates).eq('id', profile.id)
    if (err) { setError('Gagal menyimpan. Coba lagi.'); setSaving(false); return }
    onSaved({ ...profile, ...updates } as Profile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-surface-0 rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface-0">
          <h2 className="text-sm font-semibold text-text-primary">Edit Profil</h2>
          <button onClick={onClose}><TbX size={20} className="text-text-muted" /></button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 pb-8">
          {error && <p className="text-xs text-urgent bg-urgent-surface rounded-lg px-3 py-2">{error}</p>}

          <Field label="Nama Lengkap">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="input-base" placeholder="Nama kamu" />
          </Field>

          <Field label="Jenjang Studi">
            <div className="flex flex-wrap gap-2">
              {STUDY_LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => set('study_level', l.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.study_level === l.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-2 border-border text-text-secondary'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Universitas">
            <input value={form.university} onChange={e => set('university', e.target.value)}
              className="input-base" placeholder="Universitas kamu (opsional)" />
          </Field>

          <Field label="Bidang Studi">
            <input value={form.field} onChange={e => set('field', e.target.value)}
              className="input-base" placeholder="Misal: Teknik Informatika" />
          </Field>

          <Field label="IPK">
            <input value={form.gpa} onChange={e => set('gpa', e.target.value)}
              type="number" step="0.01" min="0" max="4"
              className="input-base" placeholder="Misal: 3.75" />
          </Field>

          <Field label="Bio">
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
              rows={3}
              className="input-base resize-none" placeholder="Ceritakan sedikit tentang dirimu..." />
          </Field>

          <button onClick={save} disabled={saving}
            className="w-full py-3.5 bg-primary text-white text-sm font-semibold rounded-2xl disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  )
}
