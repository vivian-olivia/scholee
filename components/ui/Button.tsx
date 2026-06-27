import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({ variant = 'primary', loading, children, className = '', disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white',
    ghost: 'bg-primary-surface text-primary',
    danger: 'bg-urgent text-white',
  }
  return (
    <button
      className={`w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? 'Memuat...' : children}
    </button>
  )
}
