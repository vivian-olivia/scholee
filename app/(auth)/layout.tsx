export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {children}
    </div>
  )
}
