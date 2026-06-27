'use client'

import { useState } from 'react'
import { TbPencil } from 'react-icons/tb'
import { getProfileCompletion } from '@/lib/utils'
import { OrgSection } from './OrgSection'
import { TagsSection } from './TagsSection'
import { EditProfileModal } from './EditProfileModal'
import type { Profile, Organisation, Tag } from '@/lib/types'

const STUDY_LABELS: Record<string, string> = {
  highschool: 'SMA', s1: 'S1', s2: 'S2', s3: 'S3', gap: 'Gap Year',
}

const completionColor = (score: number) =>
  score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-primary'

interface Props {
  profile: Profile
  orgs: Organisation[]
  tags: Tag[]
  editable?: boolean
}

export function ProfileClient({ profile: initial, orgs: initialOrgs, tags: initialTags, editable = false }: Props) {
  const [profile, setProfile] = useState(initial)
  const [showEdit, setShowEdit] = useState(false)
  const { score, hint } = getProfileCompletion(profile, initialOrgs, initialTags)

  return (
    <>
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-6 pb-5 px-4 border-b border-border">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-white">{profile.name[0].toUpperCase()}</span>
        </div>
        <h1 className="text-lg font-semibold text-text-primary mb-0.5">{profile.name}</h1>
        <p className="text-xs text-text-muted">
          {STUDY_LABELS[profile.study_level]}
          {profile.university && ` · ${profile.university}`}
        </p>
        {profile.field && (
          <p className="text-xs text-text-secondary mt-0.5">{profile.field}</p>
        )}
        {profile.gpa != null && (
          <span className="mt-2 px-2.5 py-0.5 bg-success-surface text-success text-xs font-semibold rounded-full">
            IPK {profile.gpa.toFixed(2)}
          </span>
        )}
        {editable && (
          <button
            onClick={() => setShowEdit(true)}
            className="mt-3 flex items-center gap-1.5 px-4 py-1.5 border border-border rounded-full text-xs font-medium text-text-secondary"
          >
            <TbPencil size={13} /> Edit Profil
          </button>
        )}
      </div>

      {/* Completion bar (own profile only) */}
      {editable && (
        <div className="mx-4 mt-4 bg-surface-2 border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-primary">Kelengkapan Profil</span>
            <span className="text-xs font-bold text-primary">{score}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
            <div
              className={`h-2 rounded-full transition-all ${completionColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted">{hint}</p>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Bio</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Organisations */}
      <div className="px-4 mt-5">
        <OrgSection userId={profile.id} initial={initialOrgs} editable={editable} />
      </div>

      {/* Tags */}
      <div className="px-4 mt-5 pb-8">
        <TagsSection userId={profile.id} initial={initialTags} editable={editable} />
      </div>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSaved={updated => setProfile(updated)}
        />
      )}
    </>
  )
}
