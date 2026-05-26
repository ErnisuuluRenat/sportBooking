interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = ({ variant = 'primary', size = 'md', loading, children, ...props }: ButtonProps) => {
  const base = 'font-semibold rounded-btn transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2'
  const variants = {
    primary: 'bg-orange text-white hover:opacity-90',
    ghost: 'bg-transparent border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary',
    danger: 'bg-red-500 text-white hover:opacity-90',
  }
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-sm w-full',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
      {children}
    </button>
  )
}