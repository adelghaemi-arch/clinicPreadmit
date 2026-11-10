import { LogOut, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { panelMeta } from '../../config/panels';
import { Avatar } from '../ui/Avatar';
import { cx } from '../ui/utils';
import { CLINIC } from '../../data/mock';
import { faFullDate, todayIso, faDigits } from '../../lib/utils';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    user,
    page,
    setPage,
    logout,
    appointments,
    invoices,
    vitals,
    orders,
    notify,
  } = useApp();

  if (!user) return null;
  const meta = panelMeta[user.role];
  const PanelIcon = meta.icon;
  const today = todayIso();

  const todayAppointments = appointments.filter((a) => a.date === today);
  const doctorAppointments = todayAppointments.filter(
    (a) => a.doctorId === user.doctorId && ['arrived', 'waiting', 'in-progress'].includes(a.status),
  );
  const queueCount = todayAppointments.filter((a) => ['arrived', 'waiting'].includes(a.status)).length;
  const unpaidCount = invoices.filter((i) => i.status !== 'تسویه‌شده').length;
  const triageCount = todayAppointments.filter(
    (a) => ['arrived', 'waiting'].includes(a.status) && !vitals.some((v) => v.appointmentId === a.id),
  ).length;
  const pendingServices = orders.filter((o) => o.status !== 'انجام شد').length;
  const myUnpaid = invoices.filter(
    (i) => i.patientId === user.patientId && i.status !== 'تسویه‌شده',
  ).length;

  const badgeFor = (id: string): number => {
    switch (id) {
      case 'appointments':
        return user.role === 'physician' ? doctorAppointments.length : 0;
      case 'queue':
        return queueCount;
      case 'cashier':
        return unpaidCount;
      case 'reports':
        return user.role === 'finance' ? unpaidCount : 0;
      case 'triage':
        return triageCount;
      case 'services':
        return pendingServices;
      case 'payments':
        return myUnpaid;
      default:
        return 0;
    }
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-neutral/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      ) : null}

      <aside
        className={cx(
          'fixed inset-y-0 right-0 z-50 flex w-[276px] flex-col border-l border-base-300/80 bg-base-100 transition-transform duration-300 lg:z-30 lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-base-300/70 px-4 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-black text-primary-content shadow-sm">
            م
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-base-content">{CLINIC.name}</p>
            <p className="truncate text-[10px] text-base-content/50">{CLINIC.hospital}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="grid size-8 place-items-center rounded-lg text-base-content/50 hover:bg-base-200 lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <div className={cx('relative overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-white', meta.gradient)}>
            <div className="pointer-events-none absolute -left-6 -top-8 size-24 rounded-full bg-white/15 blur-xl" />
            <div className="relative flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-white/20 backdrop-blur-sm">
                <PanelIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{meta.title}</p>
                <p className="text-[10px] text-white/70">{user.title}</p>
              </div>
            </div>
            <p className="relative mt-2 text-[10px] leading-5 text-white/75">{meta.description}</p>
          </div>
        </div>

        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          <p className="px-2 pb-1 pt-2 text-[10px] font-semibold tracking-wide text-base-content/35">
            منوی {meta.shortTitle}
          </p>
          {meta.nav.map((item) => {
            const Icon = item.icon;
            const active = item.id === page;
            const badge = badgeFor(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPage(item.id);
                  onClose();
                }}
                className={cx(
                  'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-xs font-medium transition',
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content',
                )}
              >
                <span
                  className={cx(
                    'grid size-8 shrink-0 place-items-center rounded-lg transition',
                    active ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/55 group-hover:bg-base-300',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={cx(
                      'min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold',
                      active ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/60',
                    )}
                  >
                    {faDigits(badge)}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="mt-3 rounded-xl border border-dashed border-base-300 bg-base-200/40 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-base-content/55">
              <Sparkles className="size-3.5 text-accent" /> نکته دمو
            </p>
            <p className="mt-1 text-[10px] leading-5 text-base-content/45">
              تمام داده‌ها نمونه و در حافظه مرورگر است. با منوی کاربر می‌توانید نقش را عوض کنید.
            </p>
          </div>
        </nav>

        <div className="border-t border-base-300/70 p-3">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-base-200/60 px-2.5 py-1.5 text-[10px] text-base-content/55">
            <span>امروز</span>
            <span className="font-medium">{faFullDate(today)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-base-300/70 p-2">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-base-content">{user.name}</p>
              <p className="truncate text-[10px] text-base-content/45">{user.department}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                notify('info', 'از سامانه خارج شدید');
              }}
              aria-label="خروج از حساب"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-base-content/40 transition hover:bg-error/10 hover:text-error"
            >
              <LogOut className="size-4" />
            </button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1 text-[9px] text-base-content/30">
            <ShieldCheck className="size-3" /> سامانه جامع کلینیک تخصصی — نسخه نمایشی
          </p>
        </div>
      </aside>
    </>
  );
}
