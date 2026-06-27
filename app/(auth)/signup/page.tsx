'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TbBrandGoogle } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/onboarding`,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.href = '/onboarding'
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 rounded-2xl bg-success-surface flex items-center justify-center mb-4">
          <span className="text-3xl">📬</span>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Cek emailmu!</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Kami mengirim link konfirmasi ke{' '}
          <span className="font-medium text-text-primary">{email}</span>.{' '}
          Klik link tersebut untuk melanjutkan.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-5 pt-12 pb-8 max-w-sm mx-auto w-full">
      <div className="mb-8">
        <Link href="/" className="text-lg font-semibold text-primary">Scholee</Link>
        <h1 className="text-[22px] font-semibold text-text-primary mt-6 mb-1">Daftar</h1>
        <p className="text-sm text-text-secondary">Mulai temukan beasiswamu 🚀</p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface-2 text-sm font-semibold text-text-primary transition-opacity disabled:opacity-60 mb-5"
      >
        <TbBrandGoogle size={18} />
        {googleLoading ? 'Memuat...' : 'Daftar dengan Google'}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">atau</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="kamu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-xs text-urgent bg-urgent-surface rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading} className="mt-2">
          Buat Akun
        </Button>
      </form>

      <p className="text-sm text-text-secondary text-center mt-6">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-medium">
          Masuk
        </Link>
      </p>
    </div>
  )
}
