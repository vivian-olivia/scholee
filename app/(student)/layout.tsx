import { BottomNav } from '@/components/layout/BottomNav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col max-w-lg mx-auto">
      {children}
      <BottomNav />
    </div>
  )
}
