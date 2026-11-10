import { initials } from '../../lib/utils';
import { cx } from './utils';

const tones = [
  'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
];

const sizes = {
  xs: 'size-7 text-[10px]',
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
};

export function Avatar({
  name,
  size = 'sm',
  tone,
  className,
  ring = false,
}: {
  name: string;
  size?: keyof typeof sizes;
  tone?: number;
  className?: string;
  ring?: boolean;
}) {
  const index =
    tone ??
    Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % tones.length;
  return (
    <span
      title={name}
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full font-bold select-none',
        sizes[size],
        tones[index],
        ring && 'ring-2 ring-base-100 ring-offset-2 ring-offset-primary/20',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
