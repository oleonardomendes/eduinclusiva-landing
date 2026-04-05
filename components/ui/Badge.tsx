import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'amber' | 'blue' | 'rose' | 'gray' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'green',
  size = 'sm',
  className,
}: BadgeProps) {
  const variants = {
    green:  'bg-[#D1FAE5] text-[#065F46]',
    amber:  'bg-[#FEF3C7] text-[#92400E]',
    blue:   'bg-[#DBEAFE] text-[#1E40AF]',
    rose:   'bg-[#FCE7F3] text-[#9D174D]',
    gray:   'bg-[#F3F4F6] text-[#374151]',
    purple: 'bg-[#EDE9FE] text-[#5B21B6]',
  }

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
