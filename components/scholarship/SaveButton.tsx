'use client'

import { useState } from 'react'
import { TbBookmark, TbBookmarkFilled } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'

interface SaveButtonProps {
  scholarshipId: string
  userId?: string
  initialSaved: boolean
}

export function SaveButton({ scholarshipId, userId, initialSaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    if (!userId || saving) return
    setSaving(true)
    const supabase = createClient()
    if (saved) {
      await supabase.from('saved_scholarships')
        .delete()
        .match({ user_id: userId, scholarship_id: scholarshipId })
    } else {
      await supabase.from('saved_scholarships')
        .insert({ user_id: userId, scholarship_id: scholarshipId })
    }
    setSaved(!saved)
    setSaving(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={saving || !userId}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 ${
        saved
          ? 'bg-primary-surface border-primary-tint text-primary'
          : 'bg-surface-2 border-border text-text-secondary'
      }`}
    >
      {saved ? <TbBookmarkFilled size={18} /> : <TbBookmark size={18} />}
      {saved ? 'Tersimpan' : 'Simpan'}
    </button>
  )
}
