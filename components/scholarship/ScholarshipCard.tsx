'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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

const PROVIDER_BADGE: Record<string, { label: string; cls: string }> = {
  university: { label: 'Kampus', cls: 'bg-primary-surface text-primary' },
  government: { label: 'Pemerintah', cls: 'bg-accent-surface text-accent' },
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
  const router = useRouter()
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)

  const urgency = getDeadlineUrgency(scholarship.deadline)
  const daysLabel = getDaysLabel(scholarship.deadline)
  const progress = getDeadlineProgress(scholarship.deadline)

  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation()
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

  function handleCardClick() {
    // Don't navigate if the user was selecting text
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) return
    router.push(`/scholarship/${scholarship.id}`)
  }

  const providerBadge = scholarship.provider_type ? PROVIDER_BADGE[scholarship.provider_type] : undefined

  return (
    <div
      onMouseDown={e => { mouseDownPos.current = { x: e.clientX, y: e.clientY } }}
      onClick={handleCardClick}
      className={`bg-surface-2 rounded-2xl p-4 border ${scholarship.is_featured ? 'border-primary-tint' : 'border-border'} relative cursor-pointer`}
    >
      {scholarship.is_featured && (
        <div className="flex items-center gap-1 mb-2">
          <TbStar size={12} className="text-primary fill-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Unggulan</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[11px] text-text-muted truncate">{scholarship.provider_name}</p>
            {providerBadge && (
              <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${providerBadge.cls}`}>
                {providerBadge.label}
              </span>
            )}
          </div>
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
  )
}
