import type { Scholarship } from '@/lib/types'
import { getDeadlineUrgency } from '@/lib/utils'

interface Props {
  scholarships: Scholarship[]
}

export function StatsRow({ scholarships }: Props) {
  const total = scholarships.length
  const active = scholarships.filter(s => s.status === 'active').length
  const closingSoon = scholarships.filter(s => {
    const u = getDeadlineUrgency(s.deadline)
    return s.status === 'active' && (u === 'urgent' || u === 'soon')
  }).length
  const expired = scholarships.filter(s => getDeadlineUrgency(s.deadline) === 'expired').length

  const stats = [
    { label: 'Total', value: total, color: 'text-text-primary', bg: 'bg-surface-2' },
    { label: 'Aktif', value: active, color: 'text-success', bg: 'bg-success-surface' },
    { label: 'Segera Tutup', value: closingSoon, color: 'text-warning', bg: 'bg-warning-surface' },
    { label: 'Kedaluwarsa', value: expired, color: 'text-urgent', bg: 'bg-urgent-surface' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border border-border`}>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
