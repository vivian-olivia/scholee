export default function ScholarshipLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-0 animate-pulse">
      <div className="h-14 bg-surface-2 border-b border-border" />
      <div className="px-4 pt-5 pb-4 border-b border-border flex flex-col gap-3">
        <div className="h-3 w-24 bg-border rounded" />
        <div className="h-5 w-4/5 bg-border rounded" />
        <div className="h-5 w-3/5 bg-border rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-border rounded-md" />
          <div className="h-5 w-12 bg-border rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px mx-4 mt-4 rounded-2xl overflow-hidden border border-border">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-surface-2" />)}
      </div>
      <div className="px-4 mt-5 flex flex-col gap-2">
        <div className="h-4 w-32 bg-border rounded" />
        <div className="h-3 w-full bg-border rounded" />
        <div className="h-3 w-5/6 bg-border rounded" />
      </div>
    </div>
  )
}
