import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-base-300 px-4 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-base-200 text-base-content/40">
        <Icon className="size-6" />
      </span>
      <p className="text-sm font-semibold text-base-content/70">{title}</p>
      {description ? <p className="max-w-sm text-xs leading-6 text-base-content/50">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
