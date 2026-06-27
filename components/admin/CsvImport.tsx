'use client'

import { useState, useRef } from 'react'
import { TbX, TbUpload, TbDownload, TbCheck, TbAlertCircle } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import type { Scholarship } from '@/lib/types'

const TEMPLATE_HEADERS = 'title,provider_name,provider_type,funding_type,levels,countries,deadline,amount,living_allowance,duration,requirements,description,apply_url,is_featured,status'
const TEMPLATE_ROW = 'Beasiswa Contoh,Kemendikbud,government,full,s1|s2,Indonesia,2026-12-31,Biaya kuliah penuh,Rp2.000.000/bulan,4 tahun,IPK minimal 3.0|WNI,Deskripsi singkat beasiswa ini,https://contoh.go.id,false,active'

interface ParsedRow {
  title: string
  provider_name: string
  provider_type: string
  funding_type: string
  levels: string[]
  countries: string[]
  deadline: string
  amount: string
  living_allowance: string
  duration: string
  requirements: string[]
  description: string
  apply_url: string
  is_featured: boolean
  status: string
  _errors: string[]
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim())

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const raw: Record<string, string> = {}
    headers.forEach((h, i) => { raw[h] = (values[i] ?? '').trim() })

    const errors: string[] = []
    if (!raw.title) errors.push('Judul wajib')
    if (!raw.provider_name) errors.push('Provider wajib')
    if (!raw.deadline) errors.push('Deadline wajib')
    if (!raw.apply_url) errors.push('URL wajib')

    return {
      title: raw.title ?? '',
      provider_name: raw.provider_name ?? '',
      provider_type: raw.provider_type || 'organization',
      funding_type: raw.funding_type || 'full',
      levels: raw.levels ? raw.levels.split('|').filter(Boolean) : [],
      countries: raw.countries ? raw.countries.split('|').filter(Boolean) : [],
      deadline: raw.deadline ?? '',
      amount: raw.amount ?? '',
      living_allowance: raw.living_allowance ?? '',
      duration: raw.duration ?? '',
      requirements: raw.requirements ? raw.requirements.split('|').filter(Boolean) : [],
      description: raw.description ?? '',
      apply_url: raw.apply_url ?? '',
      is_featured: raw.is_featured === 'true',
      status: raw.status || 'active',
      _errors: errors,
    }
  })
}

interface Props {
  onClose: () => void
  onImported: (scholarships: Scholarship[]) => void
}

export function CsvImport({ onClose, onImported }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  function downloadTemplate() {
    const csv = TEMPLATE_HEADERS + '\n' + TEMPLATE_ROW
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'scholee_template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setRows(parseCSV(text))
      setDone(false)
      setError('')
    }
    reader.readAsText(file, 'utf-8')
  }

  const validRows = rows.filter(r => r._errors.length === 0)
  const invalidRows = rows.filter(r => r._errors.length > 0)

  async function importRows() {
    if (validRows.length === 0) return
    setImporting(true)
    setError('')

    const payload = validRows.map(r => ({
      title: r.title,
      provider_name: r.provider_name,
      provider_type: r.provider_type,
      funding_type: r.funding_type as 'full' | 'partial',
      levels: r.levels,
      countries: r.countries,
      deadline: r.deadline,
      amount: r.amount || null,
      living_allowance: r.living_allowance || null,
      duration: r.duration || null,
      requirements: r.requirements.length > 0 ? r.requirements : null,
      description: r.description || null,
      apply_url: r.apply_url,
      is_featured: r.is_featured,
      status: r.status as 'active' | 'draft' | 'closed',
    }))

    const supabase = createClient()
    const { data, error: err } = await supabase.from('scholarships').insert(payload).select()
    if (err) { setError(err.message); setImporting(false); return }
    setDone(true)
    setImporting(false)
    if (data) onImported(data as Scholarship[])
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-surface-0 rounded-2xl w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Import CSV</h2>
          <button onClick={onClose}><TbX size={20} className="text-text-muted" /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Step 1 */}
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2">1. Download template CSV</p>
            <p className="text-xs text-text-muted mb-3">
              Isi kolom sesuai format. Array pakai separator <code className="bg-surface-1 px-1 rounded">|</code> (contoh: <code className="bg-surface-1 px-1 rounded">s1|s2</code> untuk kolom <em>levels</em>).
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-text-secondary hover:bg-surface-1 transition-colors"
            >
              <TbDownload size={16} /> Download Template
            </button>
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-xs font-semibold text-text-secondary mb-2">2. Upload file CSV yang sudah diisi</p>
            <label className="flex items-center gap-3 px-4 py-5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary-tint hover:bg-primary-surface transition-colors">
              <TbUpload size={20} className="text-text-muted shrink-0" />
              <span className="text-sm text-text-muted">
                {rows.length > 0
                  ? `${rows.length} baris ditemukan — klik untuk ganti file`
                  : 'Klik untuk pilih file CSV'}
              </span>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          </div>

          {/* Preview */}
          {rows.length > 0 && !done && (
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2">
                Preview —{' '}
                <span className="text-success">{validRows.length} valid</span>
                {invalidRows.length > 0 && (
                  <span className="text-urgent">, {invalidRows.length} error</span>
                )}
              </p>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-52">
                  <table className="w-full text-xs">
                    <thead className="bg-surface-1 border-b border-border">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-text-secondary w-6"></th>
                        <th className="px-3 py-2 text-left font-medium text-text-secondary">Judul</th>
                        <th className="px-3 py-2 text-left font-medium text-text-secondary">Provider</th>
                        <th className="px-3 py-2 text-left font-medium text-text-secondary">Deadline</th>
                        <th className="px-3 py-2 text-left font-medium text-text-secondary">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((r, i) => (
                        <tr key={i} className={r._errors.length > 0 ? 'bg-urgent-surface/50' : ''}>
                          <td className="px-3 py-2">
                            {r._errors.length === 0
                              ? <TbCheck size={13} className="text-success" />
                              : <TbAlertCircle size={13} className="text-urgent" />}
                          </td>
                          <td className="px-3 py-2 max-w-[180px] truncate">{r.title || '–'}</td>
                          <td className="px-3 py-2 max-w-[120px] truncate">{r.provider_name || '–'}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{r.deadline || '–'}</td>
                          <td className="px-3 py-2 text-urgent">{r._errors.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {error && <p className="text-xs text-urgent mt-2">{error}</p>}

              <div className="flex items-center justify-between mt-4">
                {invalidRows.length > 0 && (
                  <p className="text-xs text-warning">{invalidRows.length} baris akan dilewati</p>
                )}
                <button
                  onClick={importRows}
                  disabled={importing || validRows.length === 0}
                  className="ml-auto px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  {importing ? 'Mengimport...' : `Import ${validRows.length} Beasiswa`}
                </button>
              </div>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-3 bg-success-surface px-4 py-3 rounded-xl">
              <TbCheck size={20} className="text-success" />
              <p className="text-sm font-medium text-success">
                {validRows.length} beasiswa berhasil diimport!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
