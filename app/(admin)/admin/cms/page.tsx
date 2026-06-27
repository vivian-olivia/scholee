import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CmsClient } from '@/components/admin/CmsClient'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'vivianoliviafs@gmail.com'

export default async function CmsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false })

  return <CmsClient initial={scholarships ?? []} />
}
