'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TbCompass, TbBookmark, TbUser } from 'react-icons/tb'

const NAV = [
  { href: '/explore', label: 'Jelajahi', icon: TbCompass },
  { href: '/saved', label: 'Tersimpan', icon: TbBookmark },
  { href: '/profile', label: 'Profil', icon: TbUser },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-surface-2 border-t border-border z-20">
      <div className="flex items-center">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-center transition-colors ${
                active ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
