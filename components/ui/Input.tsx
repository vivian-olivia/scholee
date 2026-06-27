import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        className="border border-border rounded-xl px-4 py-3 text-sm text-text-primary bg-surface-2 outline-none focus:border-primary transition-colors placeholder:text-text-muted"
        {...props}
      />
      {error && <p className="text-xs text-urgent">{error}</p>}
    </div>
  )
}
