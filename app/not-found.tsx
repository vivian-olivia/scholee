import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-8 text-center">
      <span className="text-5xl mb-4">🔍</span>
      <h1 className="text-xl font-semibold text-text-primary mb-2">Halaman tidak ditemukan</h1>
      <p className="text-sm text-text-muted mb-6">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      <Link href="/explore" className="px-6 py-3 bg-primary text-white text-sm font-semibold rounded-2xl">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
