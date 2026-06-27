import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TbArrowLeft, TbExternalLink, TbCalendar, TbClock, TbWorld, TbCoin } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/server'
import { Tag } from '@/components/ui/Tag'
import { SaveButton } from '@/components/scholarship/SaveButton'
import { getDaysLabel, getDeadlineUrgency } from '@/lib/utils'

const LEVEL_LABELS: Record<string, string> = {
  highschool: 'SMA', s1: 'S1', s2: 'S2', s3: 'S3', gap: 'Gap Year',
}

const urgencyBadge = {
  urgent: 'bg-urgent-surface text-urgent',
  soon: 'bg-warning-surface text-warning',
  ok: 'bg-success-surface text-success',
  expired: 'bg-surface-1 text-text-muted',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ScholarshipDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: scholarship }, { data: { user } }] = await Promise.all([
    supabase.from('scholarships').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!scholarship) notFound()

  let isSaved = false
  if (user) {
    const { data } = await supabase
      .from('saved_scholarships')
      .select('id')
      .match({ user_id: user.id, scholarship_id: id })
      .single()
    isSaved = !!data
  }

  const urgency = getDeadlineUrgency(scholarship.deadline)
  const daysLabel = getDaysLabel(scholarship.deadline)
  const deadlineFormatted = new Date(scholarship.deadline).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="flex flex-col min-h-screen bg-surface-0">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 bg-surface-0 sticky top-0 z-10 border-b border-border">
        <Link href="/explore" className="p-1 -ml-1 text-text-secondary">
          <TbArrowLeft size={22} />
        </Link>
        <span className="text-sm font-semibold text-text-primary flex-1 truncate">Detail Beasiswa</span>
        <SaveButton
          scholarshipId={scholarship.id}
          userId={user?.id}
          initialSaved={isSaved}
        />
      </header>

      <main className="flex-1 pb-32">
        {/* Provider + title */}
        <div className="px-4 pt-5 pb-4 border-b border-border">
          {scholarship.is_featured && (
            <span className="inline-block mb-2 text-[10px] font-semibold text-primary bg-primary-surface px-2 py-0.5 rounded-md uppercase tracking-wide">
              ⭐ Unggulan
            </span>
          )}
          <p className="text-xs text-text-muted mb-1">{scholarship.provider_name}</p>
          <h1 className="text-lg font-semibold text-text-primary leading-snug mb-3">
            {scholarship.title}
          </h1>
          <div className="flex flex-wrap gap-1.5">
            <Tag
              label={scholarship.funding_type === 'full' ? 'Beasiswa Penuh' : 'Beasiswa Parsial'}
              variant={scholarship.funding_type === 'full' ? 'funding-full' : 'funding-partial'}
            />
            {scholarship.levels.map((l: string) => (
              <Tag key={l} label={LEVEL_LABELS[l] ?? l} variant="level" />
            ))}
            {scholarship.countries.map((c: string) => (
              <Tag key={c} label={c} variant="country" />
            ))}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-px bg-border mx-4 mt-4 rounded-2xl overflow-hidden border border-border">
          <InfoCell icon={<TbCalendar size={16} />} label="Deadline">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${urgencyBadge[urgency]}`}>
              {daysLabel}
            </span>
            <span className="text-[11px] text-text-muted mt-0.5">{deadlineFormatted}</span>
          </InfoCell>

          {scholarship.duration && (
            <InfoCell icon={<TbClock size={16} />} label="Durasi">
              <span className="text-xs font-medium text-text-primary">{scholarship.duration}</span>
            </InfoCell>
          )}

          {scholarship.amount && (
            <InfoCell icon={<TbCoin size={16} />} label="Nilai Beasiswa">
              <span className="text-xs font-medium text-text-primary">{scholarship.amount}</span>
              {scholarship.living_allowance && (
                <span className="text-[11px] text-text-muted mt-0.5">+ {scholarship.living_allowance}</span>
              )}
            </InfoCell>
          )}

          <InfoCell icon={<TbWorld size={16} />} label="Negara Tujuan">
            <span className="text-xs font-medium text-text-primary">
              {scholarship.countries.join(', ')}
            </span>
          </InfoCell>
        </div>

        {/* Description */}
        {scholarship.description && (
          <Section title="Tentang Beasiswa">
            <p className="text-sm text-text-secondary leading-relaxed">{scholarship.description}</p>
          </Section>
        )}

        {/* Requirements */}
        {scholarship.requirements && scholarship.requirements.length > 0 && (
          <Section title="Persyaratan">
            <ul className="flex flex-col gap-2">
              {scholarship.requirements.map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-primary-surface flex items-center justify-center text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-text-secondary leading-snug">{req}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Apply CTA */}
        <div className="px-4 mt-2">
          <a
            href={scholarship.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white text-sm font-semibold rounded-2xl"
          >
            Daftar Sekarang
            <TbExternalLink size={16} />
          </a>
          {urgency === 'urgent' && (
            <p className="text-center text-xs text-urgent mt-2 font-medium">
              ⚠️ Deadline sangat dekat — jangan tunda!
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

function InfoCell({ icon, label, children }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface-2 px-3 py-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-text-muted">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mt-5">
      <h2 className="text-sm font-semibold text-text-primary mb-3">{title}</h2>
      {children}
    </div>
  )
}
