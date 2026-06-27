'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TbBookmark, TbBookmarkFilled, TbStar } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { Tag } from '@/components/ui/Tag'
import { getDeadlineUrgency, getDaysLabel, getDeadlineProgress } from '@/lib/utils'
import type { Scholarship } from '@/lib/types'

interface ScholarshipCardProps {
  scholarship: Scholarship
  initialSaved: boolean
  userId?: string
}

const LEVEL_LABELS: Record<string, string> = {
  highschool: 'SMA', s1: 'S1', s2: 'S2', s3: 'S3', gap: 'Gap Year',
}

const urgencyBar = {
  urgent: 'bg-urgent',
  soon: 'bg-warning',
  ok: 'bg-success',
  expired: 'bg-border',
}

const urgencyText = {
  urgent: 'text-urgent',
  soon: 'text-warning',
  ok: 'text-text-muted',
  expired: 'text-text-muted',
}

export function ScholarshipCard({ scholarship, initialSaved, userId }: ScholarshipCardProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)

  const urgency = getDeadlineUrgency(scholarship.deadline)
  const daysLabel = getDaysLabel(scholarship.deadline)
  const progress = getDeadlineProgress(scholarship.deadline)

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    if (!userId || saving) return
    setSaving(true)
    const supabase = createClient()
    if (saved) {
      await supabase.from('saved_scholarships')
        .delete()
        .match({ user_id: userId, scholarship_id: scholarship.id })
    } else {
      await supabase.from('saved_scholarships')
        .insert({ user_id: userId, scholarship_id: scholarship.id })
    }
    setSaved(!saved)
    setSaving(false)
  }

  return (
    <Link href={`/scholarship/${scholarship.id}`} className="block">
      <div className={`bg-surface-2 rounded-2xl p-4 border ${scholarship.is_featured ? 'border-primary-tint' : 'border-border'} relative`}>
        {scholarship.is_featured && (
          <div className="flex items-center gap-1 mb-2">
            <TbStar size={12} className="text-primary fill-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Unggulan</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-text-muted mb-0.5 truncate">{scholarship.provider_name}</p>
            <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {scholarship.title}
            </h3>
          </div>
          <button
            onClick={toggleSave}
            disabled={saving || !userId}
            className="shrink-0 p-1 -mr-1 text-primary disabled:opacity-50"
            aria-label={saved ? 'Hapus simpan' : 'Simpan'}
          >
            {saved
              ? <TbBookmarkFilled size={20} />
              : <TbBookmark size={20} />
            }
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Tag
            label={scholarship.funding_type === 'full' ? 'Beasiswa Penuh' : 'Beasiswa Parsial'}
            variant={scholarship.funding_type === 'full' ? 'funding-full' : 'funding-partial'}
          />
          {scholarship.levels.map(l => (
            <Tag key={l} label={LEVEL_LABELS[l] ?? l} variant="level" />
          ))}
          {scholarship.countries.slice(0, 2).map(c => (
            <Tag key={c} label={c} variant="country" />
          ))}
        </div>

        {scholarship.amount && (
          <p className="text-xs text-text-secondary mb-3">
            💰 {scholarship.amount}
            {scholarship.living_allowance && ` + ${scholarship.living_allowance}`}
          </p>
        )}

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-text-muted">Deadline</span>
          <span className={`text-[11px] font-semibold ${urgencyText[urgency]}`}>{daysLabel}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-1 rounded-full transition-all ${urgencyBar[urgency]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
