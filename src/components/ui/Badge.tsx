import type { ReactNode } from 'react';
import { cx } from './utils';

export type BadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'secondary';

const tones: Record<BadgeTone, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/15 text-warning border-warning/30',
  error: 'bg-error/10 text-error border-error/25',
  info: 'bg-info/10 text-info border-info/25',
  neutral: 'bg-base-content/5 text-base-content/70 border-base-content/10',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
};

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function StatusDot({ tone = 'success', pulse = false }: { tone?: BadgeTone; pulse?: boolean }) {
  const map: Record<BadgeTone, string> = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
    neutral: 'bg-base-content/40',
    secondary: 'bg-secondary',
  };
  return (
    <span className="relative inline-flex size-2">
      {pulse ? <span className={cx('absolute inline-flex size-2 animate-ping rounded-full opacity-60', map[tone])} /> : null}
      <span className={cx('relative inline-flex size-2 rounded-full', map[tone])} />
    </span>
  );
}
