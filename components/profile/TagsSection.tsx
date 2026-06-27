'use client'

import { useState } from 'react'
import { TbX, TbPlus } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/lib/types'

interface Props {
  userId: string
  initial: Tag[]
  editable?: boolean
}

export function TagsSection({ userId, initial, editable = false }: Props) {
  const [tags, setTags] = useState(initial)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function add() {
    const label = input.trim()
    if (!label || tags.some(t => t.label.toLowerCase() === label.toLowerCase())) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('tags')
      .insert({ user_id: userId, label })
      .select()
      .single()
    if (data) setTags(prev => [...prev, data])
    setInput('')
    setSaving(false)
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('tags').delete().eq('id', id)
    setTags(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary mb-3">Minat &amp; Bidang</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-surface text-primary text-xs font-medium rounded-full"
          >
            {tag.label}
            {editable && (
              <button onClick={() => remove(tag.id)} className="ml-0.5 hover:text-primary-dark">
                <TbX size={12} />
              </button>
            )}
          </span>
        ))}
        {editable && (
          <div className="flex items-center gap-1">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="Tambah minat..."
              className="text-xs bg-surface-2 border border-border rounded-full px-3 py-1 outline-none text-text-primary placeholder:text-text-muted w-36"
            />
            <button
              onClick={add}
              disabled={saving || !input.trim()}
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center disabled:opacity-40"
            >
              <TbPlus size={14} className="text-white" />
            </button>
          </div>
        )}
      </div>
      {tags.length === 0 && !editable && (
        <p className="text-xs text-text-muted">Belum ada minat ditambahkan.</p>
      )}
    </div>
  )
}
