import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Palette,
  Sun,
  Users,
} from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { panelMeta } from '../../config/panels';
import { notifications } from '../../data/mock';
import { themeOptions } from '../../lib/themes';
import { Avatar } from '../ui/Avatar';
import { cx } from '../ui/utils';
import { faFullDate, faDigits, todayIso } from '../../lib/utils';
import type { RoleId } from '../../types';

type Menu = 'notifications' | 'theme' | 'user' | null;

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, page, isDark, toggleTheme, theme, setTheme, switchRole, logout, notify } = useApp();
  const [menu, setMenu] = useState<Menu>(null);
  const [time, setTime] = useState(() =>
    new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!user) return null;
  const meta = panelMeta[user.role];
  const activeItem = meta.nav.find((item) => item.id === page);
  const PanelIcon = meta.icon;

  const handleRole = (role: RoleId) => {
    switchRole(role);
    setMenu(null);
    notify('info', 'نقش کاربری تغییر کرد', `اکنون در ${panelMeta[role].title} هستید.`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-base-300/70 bg-base-100/85 backdrop-blur-md">
      <div ref={ref} className="flex h-16 items-center gap-2 px-3 sm:px-5">
        <button
          type="button"
          onClick={onMenu}
          aria-label="باز کردن منو"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-base-300 text-base-content/70 transition hover:bg-base-200 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-base-content/45">
            <PanelIcon className="size-3" />
            <span className="truncate">{meta.title}</span>
            <span>/</span>
            <span className="truncate text-base-content/60">{activeItem?.short ?? 'داشبورد'}</span>
          </div>
          <h2 className="truncate text-sm font-bold text-base-content sm:text-base">
            {activeItem?.label ?? 'داشبورد'}
          </h2>
        </div>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-base-300/70 bg-base-100 px-2.5 py-1.5 text-[11px] text-base-content/60 md:flex">
            <CalendarDays className="size-3.5 text-primary" />
            <span className="font-medium">{faFullDate(todayIso())}</span>
            <span className="h-3 w-px bg-base-300" />
            <span className="tabular-nums" dir="ltr">{time}</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'حالت روشن' : 'حالت تاریک'}
            className="grid size-9 place-items-center rounded-xl border border-base-300/70 text-base-content/60 transition hover:bg-base-200 hover:text-base-content"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => (m === 'theme' ? null : 'theme'))}
              className={cx(
                'hidden size-9 place-items-center rounded-xl border border-base-300/70 text-base-content/60 transition hover:bg-base-200 hover:text-base-content sm:grid',
                menu === 'theme' && 'bg-base-200 text-base-content',
              )}
              aria-label="انتخاب تم"
            >
              <Palette className="size-4" />
            </button>
            {menu === 'theme' ? (
              <div className="absolute end-0 mt-2 w-64 animate-pop-in rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl">
                <p className="px-2 pb-2 pt-1 text-[11px] font-semibold text-base-content/55">
                  تم‌های DaisyUI
                </p>
                <div className="grid gap-1">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setTheme(option.id);
                        setMenu(null);
                      }}
                      className={cx(
                        'flex items-center gap-2 rounded-lg px-2 py-2 text-right text-xs transition hover:bg-base-200',
                        theme === option.id && 'bg-primary/5',
                      )}
                    >
                      <span className="size-4 rounded-full border border-base-300" style={{ backgroundColor: option.swatch }} />
                      <span className="flex-1">
                        <span className="block font-medium text-base-content">{option.label}</span>
                        <span className="block text-[10px] text-base-content/40">{option.hint}</span>
                      </span>
                      {option.dark ? (
                        <Moon className="size-3 text-base-content/30" />
                      ) : (
                        <Sun className="size-3 text-base-content/30" />
                      )}
                      {theme === option.id ? <Check className="size-4 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => (m === 'notifications' ? null : 'notifications'))}
              aria-label="اعلان‌ها"
              className="relative grid size-9 place-items-center rounded-xl border border-base-300/70 text-base-content/60 transition hover:bg-base-200 hover:text-base-content"
            >
              <Bell className="size-4" />
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-error text-[9px] font-bold text-error-content">
                {faDigits(notifications.length)}
              </span>
            </button>
            {menu === 'notifications' ? (
              <div className="absolute end-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] animate-pop-in overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                <div className="flex items-center justify-between border-b border-base-300/70 px-4 py-3">
                  <p className="text-xs font-bold text-base-content">اعلان‌های سامانه</p>
                  <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] text-error">
                    {faDigits(notifications.length)} جدید
                  </span>
                </div>
                <ul className="max-h-80 divide-y divide-base-300/60 overflow-y-auto">
                  {notifications.map((item) => (
                    <li key={item.id} className="px-4 py-3 transition hover:bg-base-200/50">
                      <div className="flex items-start gap-2">
                        <span
                          className={cx(
                            'mt-1 size-2 shrink-0 rounded-full',
                            item.kind === 'error' && 'bg-error',
                            item.kind === 'warning' && 'bg-warning',
                            item.kind === 'success' && 'bg-success',
                            item.kind === 'info' && 'bg-info',
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-base-content">{item.title}</p>
                          <p className="mt-0.5 text-[10px] leading-5 text-base-content/55">{item.body}</p>
                          <p className="mt-1 text-[9px] text-base-content/35">{item.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setMenu(null)}
                  className="w-full border-t border-base-300/70 py-2 text-[11px] font-medium text-primary hover:bg-base-200/50"
                >
                  مشاهده همه اعلان‌ها
                </button>
              </div>
            ) : null}
          </div>

          <span className="mx-0.5 hidden h-6 w-px bg-base-300 sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => (m === 'user' ? null : 'user'))}
              className="flex items-center gap-2 rounded-xl border border-base-300/70 px-1.5 py-1 transition hover:bg-base-200 sm:ps-2"
            >
              <Avatar name={user.name} size="xs" />
              <span className="hidden text-right sm:block">
                <span className="block max-w-28 truncate text-[11px] font-bold text-base-content">{user.name}</span>
                <span className="block text-[9px] text-base-content/45">{user.title}</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-base-content/40 sm:block" />
            </button>

            {menu === 'user' ? (
              <div className="absolute end-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] animate-pop-in rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl">
                <div className="flex items-center gap-2.5 rounded-xl bg-base-200/60 p-2.5">
                  <Avatar name={user.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-base-content">{user.name}</p>
                    <p className="truncate text-[10px] text-base-content/50">{user.title} · {user.department}</p>
                  </div>
                </div>

                <p className="flex items-center gap-1.5 px-2 pb-1 pt-3 text-[10px] font-semibold text-base-content/45">
                  <Users className="size-3.5" /> تغییر نقش (حالت دمو)
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.values(panelMeta).map((panel) => {
                    const Icon = panel.icon;
                    return (
                      <button
                        key={panel.id}
                        type="button"
                        onClick={() => handleRole(panel.id)}
                        className={cx(
                          'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] transition',
                          user.role === panel.id
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-base-content/60 hover:bg-base-200',
                        )}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate">{panel.shortTitle}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenu(null);
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-medium text-error transition hover:bg-error/10"
                >
                  <LogOut className="size-4" /> خروج از حساب کاربری
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
