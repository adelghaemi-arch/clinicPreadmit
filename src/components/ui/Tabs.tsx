import type { LucideIcon } from 'lucide-react';
import { cx } from './utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cx('flex gap-1 overflow-x-auto rounded-xl bg-base-200/80 p-1', className)}>
      {items.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cx(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
              active
                ? 'bg-base-100 text-base-content shadow-sm'
                : 'text-base-content/55 hover:text-base-content',
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span
                className={cx(
                  'rounded-full px-1.5 text-[10px]',
                  active ? 'bg-primary/10 text-primary' : 'bg-base-content/10 text-base-content/50',
                )}
              >
                {tab.count.toLocaleString('fa-IR')}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
