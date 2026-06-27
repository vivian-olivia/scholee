export type StudyLevel = 'highschool' | 's1' | 's2' | 's3' | 'gap'
export type FundingType = 'full' | 'partial'
export type ScholarshipStatus = 'active' | 'closed' | 'draft'

export interface Profile {
  id: string
  name: string
  avatar_url?: string
  study_level: StudyLevel
  university?: string
  field?: string
  gpa?: number
  bio?: string
  created_at: string
}

export interface Scholarship {
  id: string
  title: string
  provider_name: string
  provider_logo_url?: string
  amount?: string
  living_allowance?: string
  funding_type: FundingType
  levels: string[]
  countries: string[]
  deadline: string
  duration?: string
  requirements?: string[]
  description?: string
  apply_url: string
  is_featured: boolean
  status: ScholarshipStatus
  created_at: string
}

export interface SavedScholarship {
  id: string
  user_id: string
  scholarship_id: string
  saved_at: string
  scholarship?: Scholarship
}

export interface Organisation {
  id: string
  user_id: string
  name: string
  role: string
  start_date?: string
  end_date?: string
  is_current: boolean
}

export interface Tag {
  id: string
  user_id: string
  label: string
}
