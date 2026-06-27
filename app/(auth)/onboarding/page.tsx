'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { StudyLevel } from '@/lib/types'

const STUDY_LEVELS: { value: StudyLevel; label: string; sub: string }[] = [
  { value: 'highschool', label: 'SMA / SMK', sub: 'Masih di sekolah' },
  { value: 's1', label: 'S1 / Sarjana', sub: 'Program sarjana' },
  { value: 's2', label: 'S2 / Magister', sub: 'Program magister' },
  { value: 's3', label: 'S3 / Doktoral', sub: 'Program doktoral' },
  { value: 'gap', label: 'Gap Year', sub: 'Belum / jeda kuliah' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [studyLevel, setStudyLevel] = useState<StudyLevel>('s1')
  const [university, setUniversity] = useState('')
  const [field, setField] = useState('')
  const [gpa, setGpa] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill name from Google account; skip onboarding if profile already exists
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      if (profile) {
        router.replace('/explore')
        return
      }
      const googleName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
      if (googleName) setName(googleName)
    })
  }, [router])

  async function handleComplete() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      study_level: studyLevel,
      university: university.trim() || null,
      field: field.trim() || null,
      gpa: gpa ? parseFloat(gpa) : null,
    })

    if (error) {
      setError('Gagal menyimpan profil. Coba lagi.')
      setLoading(false)
      return
    }

    router.push('/explore')
  }

  const progress = (step / 3) * 100

  return (
    <div className="flex-1 flex flex-col px-5 pt-10 pb-8 max-w-sm mx-auto w-full">
      {/* Progress bar */}
      <div className="h-1 bg-border rounded-full mb-8">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {step === 1 && (
        <div className="flex flex-col flex-1">
          <p className="text-xs font-medium text-text-muted mb-1">Langkah 1 dari 3</p>
          <h2 className="text-[22px] font-semibold text-text-primary mb-1">Halo! Siapa namamu?</h2>
          <p className="text-sm text-text-secondary mb-6">Ini akan ditampilkan di profilmu.</p>

          <div className="flex flex-col gap-4 mb-6">
            <Input
              label="Nama lengkap"
              placeholder="Nama kamu"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <p className="text-sm font-medium text-text-primary mb-3">Jenjang pendidikanmu</p>
          <div className="flex flex-col gap-2 mb-auto">
            {STUDY_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => setStudyLevel(level.value)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                  studyLevel === level.value
                    ? 'border-primary bg-primary-surface'
                    : 'border-border bg-surface-2'
                }`}
              >
                <span className={`text-sm font-medium ${studyLevel === level.value ? 'text-primary' : 'text-text-primary'}`}>
                  {level.label}
                </span>
                <span className="text-xs text-text-muted">{level.sub}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="mt-6"
          >
            Lanjut
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col flex-1">
          <p className="text-xs font-medium text-text-muted mb-1">Langkah 2 dari 3</p>
          <h2 className="text-[22px] font-semibold text-text-primary mb-1">Di mana kamu belajar?</h2>
          <p className="text-sm text-text-secondary mb-6">Opsional — bisa diisi nanti.</p>

          <div className="flex flex-col gap-4 mb-auto">
            <Input
              label="Universitas / Sekolah"
              placeholder="Universitas Indonesia"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              autoFocus
            />
            <Input
              label="Jurusan / Bidang studi"
              placeholder="Teknik Informatika"
              value={field}
              onChange={e => setField(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary"
            >
              Kembali
            </button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Lanjut
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col flex-1">
          <p className="text-xs font-medium text-text-muted mb-1">Langkah 3 dari 3</p>
          <h2 className="text-[22px] font-semibold text-text-primary mb-1">Berapa IPK-mu?</h2>
          <p className="text-sm text-text-secondary mb-6">Opsional — membantu menemukan beasiswa yang cocok.</p>

          <div className="flex flex-col gap-4 mb-auto">
            <Input
              label="IPK (0.00 – 4.00)"
              type="number"
              placeholder="3.50"
              min="0"
              max="4"
              step="0.01"
              value={gpa}
              onChange={e => setGpa(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-urgent bg-urgent-surface rounded-lg px-3 py-2 mt-4">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary"
            >
              Kembali
            </button>
            <Button onClick={handleComplete} loading={loading} className="flex-1">
              Selesai 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
