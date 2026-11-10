import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cx } from './utils';

export type StatTone = 'teal' | 'rose' | 'indigo' | 'amber' | 'sky' | 'emerald' | 'purple' | 'fuchsia';

const toneStyles: Record<StatTone, { tile: string; glow: string; bar: string }> = {
  teal: { tile: 'bg-teal-500/10 text-teal-600 dark:text-teal-300', glow: 'from-teal-500/10', bar: 'bg-teal-500' },
  rose: { tile: 'bg-rose-500/10 text-rose-600 dark:text-rose-300', glow: 'from-rose-500/10', bar: 'bg-rose-500' },
  indigo: { tile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300', glow: 'from-indigo-500/10', bar: 'bg-indigo-500' },
  amber: { tile: 'bg-amber-500/10 text-amber-600 dark:text-amber-300', glow: 'from-amber-500/10', bar: 'bg-amber-500' },
  sky: { tile: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', glow: 'from-sky-500/10', bar: 'bg-sky-500' },
  emerald: { tile: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300', glow: 'from-emerald-500/10', bar: 'bg-emerald-500' },
  purple: { tile: 'bg-purple-500/10 text-purple-600 dark:text-purple-300', glow: 'from-purple-500/10', bar: 'bg-purple-500' },
  fuchsia: { tile: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300', glow: 'from-fuchsia-500/10', bar: 'bg-fuchsia-500' },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'teal',
  trend,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
  trend?: { value: string; up: boolean };
  className?: string;
}) {
  const styles = toneStyles[tone];
  return (
    <div
      className={cx(
        'group relative overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div
        className={cx(
          'pointer-events-none absolute -left-8 -top-10 size-28 rounded-full bg-gradient-to-br to-transparent blur-2xl',
          styles.glow,
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <span className={cx('grid size-10 place-items-center rounded-xl', styles.tile)}>
          <Icon className="size-5" />
        </span>
        {trend ? (
          <span
            className={cx(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              trend.up
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error',
            )}
          >
            {trend.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-xl font-extrabold tracking-tight text-base-content sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-base-content/60">{label}</p>
      {hint ? <p className="mt-1 text-[11px] text-base-content/40">{hint}</p> : null}
    </div>
  );
}
