import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from './utils';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-neutral/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cx(
          'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-base-300 bg-base-100 shadow-2xl animate-pop-in sm:rounded-2xl',
          sizes[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-base-300/70 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-base-content">{title}</h3>
            {description ? <p className="mt-0.5 text-xs text-base-content/55">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-base-content/50 transition hover:bg-base-200 hover:text-base-content"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-base-300/70 bg-base-200/50 px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
