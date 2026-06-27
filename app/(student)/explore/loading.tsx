export default function ExploreLoading() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-20">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-44 bg-surface-2 border border-border rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}
