'use client'

import { useState } from 'react'
import { TbPlus, TbTrash, TbBriefcase } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import type { Organisation } from '@/lib/types'

interface Props {
  userId: string
  initial: Organisation[]
  editable?: boolean
}

export function OrgSection({ userId, initial, editable = false }: Props) {
  const [orgs, setOrgs] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', start_date: '', is_current: false })
  const [saving, setSaving] = useState(false)

  async function add() {
    if (!form.name || !form.role) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('organisations')
      .insert({ user_id: userId, name: form.name, role: form.role, start_date: form.start_date || null, is_current: form.is_current })
      .select()
      .single()
    if (data) setOrgs(prev => [...prev, data])
    setForm({ name: '', role: '', start_date: '', is_current: false })
    setShowForm(false)
    setSaving(false)
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('organisations').delete().eq('id', id)
    setOrgs(prev => prev.filter(o => o.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">Pengalaman Organisasi</h2>
        {editable && (
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1 text-xs text-primary font-medium">
            <TbPlus size={14} /> Tambah
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface-1 border border-border rounded-xl p-3 mb-3 flex flex-col gap-2">
          <input
            placeholder="Nama organisasi"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 outline-none text-text-primary placeholder:text-text-muted"
          />
          <input
            placeholder="Jabatan / peran"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 outline-none text-text-primary placeholder:text-text-muted"
          />
          <input
            type="month"
            value={form.start_date}
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            className="text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 outline-none text-text-primary"
          />
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={e => setForm(f => ({ ...f, is_current: e.target.checked }))}
              className="accent-primary"
            />
            Masih aktif
          </label>
          <div className="flex gap-2">
            <button onClick={add} disabled={saving} className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-lg disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-xs text-text-secondary rounded-lg">
              Batal
            </button>
          </div>
        </div>
      )}

      {orgs.length === 0 ? (
        <p className="text-xs text-text-muted py-2">Belum ada pengalaman organisasi.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {orgs.map(org => (
            <div key={org.id} className="flex items-start gap-3 bg-surface-1 rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center shrink-0">
                <TbBriefcase size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{org.name}</p>
                <p className="text-xs text-text-muted">{org.role}{org.is_current ? ' · Sekarang' : ''}</p>
              </div>
              {editable && (
                <button onClick={() => remove(org.id)} className="shrink-0 p-1 text-text-muted">
                  <TbTrash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
