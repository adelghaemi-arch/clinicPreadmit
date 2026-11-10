import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from './utils';

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cx(
        'rounded-2xl border border-base-300/80 bg-base-100 shadow-sm shadow-base-content/5',
        padded && 'p-4 sm:p-5',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div>
          <h3 className="text-sm font-bold text-base-content">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs leading-5 text-base-content/60">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
