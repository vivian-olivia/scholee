import Link from 'next/link'

interface TopBarProps {
  title?: string
  userInitial?: string
}

export function TopBar({ title = 'Scholee', userInitial }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-5 py-4 bg-surface-0 sticky top-0 z-10 border-b border-border">
      <span className="text-lg font-semibold text-primary">{title}</span>
      {userInitial && (
        <Link href="/profile">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{userInitial.toUpperCase()}</span>
          </div>
        </Link>
      )}
    </header>
  )
}
