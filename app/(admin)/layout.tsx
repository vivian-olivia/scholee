export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-1">
      <header className="bg-surface-2 border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-base font-semibold text-primary">Scholee Admin</span>
        <span className="text-xs text-text-muted">CMS</span>
      </header>
      <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
