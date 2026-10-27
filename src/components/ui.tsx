import type { InputHTMLAttributes, ReactNode } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, className = '', ...props }: TextFieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      <input
        {...props}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none ${className}`}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  onChange?: (value: number) => void;
}

export function NumberField({ label, hint, onChange, className = '', ...props }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      <input
        type="number"
        {...props}
        onChange={(e) => onChange?.(e.target.value === '' ? 0 : Number(e.target.value))}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder-slate-400 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none ${className}`}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function SelectField({ label, value, onChange, options, hint }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function CheckboxField({ label, checked, onChange, hint }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <span className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-5 w-5 rounded-md border-2 border-slate-300 transition peer-checked:border-teal-600 peer-checked:bg-teal-600 group-hover:border-teal-500" />
        {checked && (
          <svg
            className="absolute left-0.5 top-0.5 h-4 w-4 text-white pointer-events-none"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-slate-700">
        {label}
        {hint && <span className="block text-xs text-slate-500 mt-0.5">{hint}</span>}
      </span>
    </label>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function Section({ title, subtitle, children, icon }: SectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-slate-100">
        {icon && <div className="flex-shrink-0 text-teal-600 mt-0.5">{icon}</div>}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

interface InfoBoxProps {
  children: ReactNode;
  variant?: 'info' | 'warning';
}

export function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  const styles = {
    info: 'bg-teal-50 border-teal-200 text-teal-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}
