'use client'

import { useState } from 'react'
import { TbPlus, TbPencil, TbTrash, TbLink, TbCheck, TbX, TbLoader2, TbFileImport } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { StatsRow } from './StatsRow'
import { CmsForm } from './CmsForm'
import { CsvImport } from './CsvImport'
import { getDaysLabel, getDeadlineUrgency } from '@/lib/utils'
import type { Scholarship } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = { active: 'Aktif', draft: 'Draft', closed: 'Ditutup' }
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-success-surface text-success',
  draft: 'bg-warning-surface text-warning',
  closed: 'bg-surface-1 text-text-muted',
}
const PROVIDER_LABELS: Record<string, string> = {
  university: 'Kampus',
  government: 'Pemerintah',
  organization: 'Organisasi',
}

type UrlStatus = 'idle' | 'checking' | 'ok' | 'error'

interface Props {
  initial: Scholarship[]
}

export function CmsClient({ initial }: Props) {
  const [scholarships, setScholarships] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState<Scholarship | undefined>()
  const [urlStatus, setUrlStatus] = useState<Record<string, UrlStatus>>({})

  function openAdd() { setEditing(undefined); setShowForm(true) }
  function openEdit(s: Scholarship) { setEditing(s); setShowForm(true) }

  function onSaved(s: Scholarship) {
    setScholarships(prev => {
      const idx = prev.findIndex(x => x.id === s.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = s; return next }
      return [s, ...prev]
    })
  }

  function onImported(imported: Scholarship[]) {
    setScholarships(prev => [...imported, ...prev])
  }

  async function remove(id: string) {
    if (!confirm('Hapus beasiswa ini?')) return
    const supabase = createClient()
    await supabase.from('scholarships').delete().eq('id', id)
    setScholarships(prev => prev.filter(s => s.id !== id))
    setUrlStatus(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  async function checkUrl(id: string, url: string) {
    setUrlStatus(prev => ({ ...prev, [id]: 'checking' }))
    try {
      const res = await fetch(`/api/check-url?url=${encodeURIComponent(url)}`)
      const { ok } = await res.json()
      setUrlStatus(prev => ({ ...prev, [id]: ok ? 'ok' : 'error' }))
    } catch {
      setUrlStatus(prev => ({ ...prev, [id]: 'error' }))
    }
  }

  async function checkAllUrls() {
    for (const s of scholarships) {
      await checkUrl(s.id, s.apply_url)
    }
  }

  return (
    <>
      <StatsRow scholarships={scholarships} />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-text-primary">Beasiswa</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={checkAllUrls}
            className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-1 transition-colors"
          >
            <TbLink size={16} /> Cek Semua URL
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-1 transition-colors"
          >
            <TbFileImport size={16} /> Import CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl"
          >
            <TbPlus size={16} /> Tambah
          </button>
        </div>
      </div>

      <div className="bg-surface-2 rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-1 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Beasiswa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Sumber</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Deadline</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Tipe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary">URL</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {scholarships.map(s => {
              const urgency = getDeadlineUrgency(s.deadline)
              const urgencyDot = { urgent: 'text-urgent', soon: 'text-warning', ok: 'text-success', expired: 'text-text-muted' }
              const us = urlStatus[s.id] ?? 'idle'
              return (
                <tr key={s.id} className="hover:bg-surface-1 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary truncate max-w-xs">{s.title}</p>
                    <p className="text-xs text-text-muted">{s.provider_name}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-text-secondary">
                      {PROVIDER_LABELS[s.provider_type ?? 'organization'] ?? 'Organisasi'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold ${urgencyDot[urgency]}`}>{getDaysLabel(s.deadline)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-text-secondary">
                      {s.funding_type === 'full' ? 'Penuh' : 'Parsial'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_COLOR[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {us === 'idle' && (
                      <button
                        onClick={() => checkUrl(s.id, s.apply_url)}
                        className="text-[11px] text-text-muted hover:text-primary underline underline-offset-2"
                      >
                        Cek
                      </button>
                    )}
                    {us === 'checking' && (
                      <TbLoader2 size={14} className="text-text-muted animate-spin" />
                    )}
                    {us === 'ok' && (
                      <span className="flex items-center gap-1 text-[11px] text-success">
                        <TbCheck size={14} /> OK
                      </span>
                    )}
                    {us === 'error' && (
                      <span className="flex items-center gap-1 text-[11px] text-urgent">
                        <TbX size={14} /> Error
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-primary-surface transition-colors">
                        <TbPencil size={16} />
                      </button>
                      <button onClick={() => remove(s.id)} className="p-1.5 text-text-muted hover:text-urgent rounded-lg hover:bg-urgent-surface transition-colors">
                        <TbTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {scholarships.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-text-muted">Belum ada beasiswa.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CmsForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSaved={onSaved}
        />
      )}

      {showImport && (
        <CsvImport
          onClose={() => setShowImport(false)}
          onImported={onImported}
        />
      )}
    </>
  )
}
