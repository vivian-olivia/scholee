import type { Profile, Organisation, Tag } from './types'

// Deadline urgency level
export function getDeadlineUrgency(deadline: string): 'urgent' | 'soon' | 'ok' | 'expired' {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 7) return 'urgent'
  if (days <= 30) return 'soon'
  return 'ok'
}

// Progress bar fill % (60-day window)
export function getDeadlineProgress(deadline: string): number {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  return Math.min(100, Math.max(0, ((60 - days) / 60) * 100))
}

// Days remaining label
export function getDaysLabel(deadline: string): string {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  if (days === 1) return '1 day left'
  if (days <= 30) return `${days} days left`
  return new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Profile completion score
export function getProfileCompletion(profile: Profile, orgs: Organisation[], tags: Tag[]): {
  score: number
  hint: string
} {
  let score = 20 // base for signing up
  if (profile.avatar_url) score += 10
  if (profile.bio) score += 15
  if (profile.university) score += 10
  if (profile.field) score += 10
  if (profile.gpa) score += 15
  if (orgs.length > 0) score += 10
  if (tags.length > 0) score += 10

  const hints: Record<number, string> = {
    20: 'Add a profile photo to stand out',
    30: 'Add your university to get campus scholarships',
    40: 'Add your field of study for better matches',
    50: 'Add your GPA to unlock more scholarships',
    55: 'Add your GPA to unlock more scholarships',
    65: 'Add an organisation experience to strengthen your profile',
    75: 'Add interest tags to personalise your matches',
    85: 'Add a bio to complete your profile',
    100: 'Your profile is complete!'
  }

  const closestKey = Object.keys(hints)
    .map(Number)
    .filter(k => k >= score)
    .sort((a, b) => a - b)[0] ?? 100

  return { score, hint: hints[closestKey] }
}
