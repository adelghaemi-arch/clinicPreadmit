import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import type { ToastKind } from '../../types';
import { cx } from './utils';

const styles: Record<ToastKind, { icon: typeof Info; wrap: string; iconClass: string }> = {
  success: { icon: CheckCircle2, wrap: 'border-success/30', iconClass: 'text-success' },
  error: { icon: XCircle, wrap: 'border-error/30', iconClass: 'text-error' },
  warning: { icon: AlertTriangle, wrap: 'border-warning/40', iconClass: 'text-warning' },
  info: { icon: Info, wrap: 'border-info/30', iconClass: 'text-info' },
};

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-4 sm:translate-x-0">
      {toasts.map((toast) => {
        const style = styles[toast.kind];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            className={cx(
              'pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-base-100/95 p-3 shadow-lg backdrop-blur animate-fade-up',
              style.wrap,
            )}
          >
            <Icon className={cx('mt-0.5 size-5 shrink-0', style.iconClass)} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-base-content">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-[11px] leading-5 text-base-content/60">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="grid size-6 shrink-0 place-items-center rounded-md text-base-content/40 hover:bg-base-200 hover:text-base-content"
              aria-label="بستن پیام"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
