import type { ReactNode } from 'react';
import { cx } from './utils';

export function Field({
  label,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-base-content/70">
        {label}
        {required ? <span className="text-error">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-base-content/45">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

export const selectClass = `${inputClass} clinic-select`;
