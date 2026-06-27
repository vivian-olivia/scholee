'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TbBrandGoogle } from 'react-icons/tb'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    router.push('/explore')
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/explore`,
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col px-5 pt-12 pb-8 max-w-sm mx-auto w-full">
      <div className="mb-8">
        <Link href="/" className="text-lg font-semibold text-primary">Scholee</Link>
        <h1 className="text-[22px] font-semibold text-text-primary mt-6 mb-1">Masuk</h1>
        <p className="text-sm text-text-secondary">Selamat datang kembali 👋</p>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface-2 text-sm font-semibold text-text-primary transition-opacity disabled:opacity-60 mb-5"
      >
        <TbBrandGoogle size={18} />
        {googleLoading ? 'Memuat...' : 'Masuk dengan Google'}
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
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="text-xs text-urgent bg-urgent-surface rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading} className="mt-2">
          Masuk
        </Button>
      </form>

      <p className="text-sm text-text-secondary text-center mt-6">
        Belum punya akun?{' '}
        <Link href="/signup" className="text-primary font-medium">
          Daftar
        </Link>
      </p>
    </div>
  )
}
