import Link from 'next/link'
import { TbSearch, TbBookmark, TbBell } from 'react-icons/tb'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-0 flex flex-col">
      <nav className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-semibold text-primary">Scholee</span>
        <Link href="/login" className="text-sm font-medium text-primary">
          Masuk
        </Link>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary-surface flex items-center justify-center mb-6">
          <span className="text-4xl">🎓</span>
        </div>
        <h1 className="text-[28px] font-semibold text-text-primary leading-snug mb-3">
          Temukan Beasiswa<br />Impianmu
        </h1>
        <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-8">
          Platform pencarian beasiswa terlengkap untuk pelajar Indonesia. Simpan, pantau, dan jangan lewatkan satu pun deadline.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/signup"
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold text-center"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="w-full py-3 rounded-xl bg-primary-surface text-primary text-sm font-semibold text-center"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
      </section>

      <section className="px-5 pb-10 grid grid-cols-3 gap-3 max-w-sm mx-auto w-full">
        {[
          { icon: TbSearch, label: '500+', sub: 'Beasiswa Aktif' },
          { icon: TbBookmark, label: 'Simpan', sub: 'Favoritmu' },
          { icon: TbBell, label: 'Pantau', sub: 'Deadline' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="bg-surface-2 rounded-xl p-3 text-center border border-border">
            <Icon size={20} className="text-primary mx-auto mb-1" />
            <p className="text-sm font-semibold text-text-primary">{label}</p>
            <p className="text-[10px] text-text-muted">{sub}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
