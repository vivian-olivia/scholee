interface TagProps {
  label: string
  variant?: 'level' | 'country' | 'funding-full' | 'funding-partial'
}

const variants = {
  level: 'bg-primary-surface text-primary',
  country: 'bg-accent-surface text-accent',
  'funding-full': 'bg-success-surface text-success',
  'funding-partial': 'bg-warning-surface text-warning',
}

export function Tag({ label, variant = 'level' }: TagProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
