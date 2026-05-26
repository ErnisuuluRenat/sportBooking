interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({ label, error, ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs text-text-muted uppercase tracking-wider">{label}</label>}
    <input
      className="bg-bg-secondary border border-border-subtle rounded-btn px-4 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none focus:border-orange transition-colors"
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
)