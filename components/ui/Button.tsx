'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-[#1B4332] text-white hover:bg-[#2D6A4F] focus-visible:ring-[#1B4332] shadow-green hover:shadow-soft-lg active:scale-[0.98]',
      secondary:
        'bg-white text-[#1B4332] border-2 border-[#1B4332] hover:bg-[#F0F7F4] focus-visible:ring-[#1B4332] active:scale-[0.98]',
      amber:
        'bg-[#F59E0B] text-white hover:bg-[#D97706] focus-visible:ring-[#F59E0B] shadow-soft hover:shadow-soft-lg active:scale-[0.98]',
      outline:
        'bg-transparent text-[#1B4332] border-2 border-[#1B4332] hover:bg-[#1B4332] hover:text-white focus-visible:ring-[#1B4332] active:scale-[0.98]',
      ghost:
        'bg-transparent text-[#4A5568] hover:text-[#1B4332] hover:bg-[#F0F7F4] focus-visible:ring-[#1B4332]',
    }

    const sizes = {
      sm: 'text-sm px-4 py-2',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-6 py-3',
      xl: 'text-lg px-8 py-4',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
