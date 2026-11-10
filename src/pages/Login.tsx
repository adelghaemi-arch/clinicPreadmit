import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  X,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  UserRoundCheck,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { cx as cn } from '../components/ui/utils';
import { staffUsers, DEMO_OTP, CLINIC } from '../data/mock';
import { panelMeta } from '../config/panels';
import { useApp } from '../store/AppStore';
import { faDigits, toEnDigits } from '../lib/utils';
import type { StaffUser } from '../types';

type Step = 'phone' | 'otp';

export function Login() {
  const { findUserByPhone, login, notify, isDark, toggleTheme } = useApp();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '']);
  const [pendingUser, setPendingUser] = useState<StaffUser | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(90);
  const [shake, setShake] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== 'otp') return;
    setSeconds(90);
    const timer = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    const focus = window.setTimeout(() => inputs.current[0]?.focus(), 250);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(focus);
    };
  }, [step]);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const goToOtp = (user: StaffUser) => {
    setPendingUser(user);
    setPhone(user.phone);
    setDigits(['', '', '', '', '']);
    setError('');
    setStep('otp');
  };

  const handlePhoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = toEnDigits(phone).replace(/\D/g, '');
    if (normalized.length !== 11 || !normalized.startsWith('09')) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
      triggerShake();
      return;
    }
    setSending(true);
    setError('');
    window.setTimeout(() => {
      const user = findUserByPhone(normalized);
      setSending(false);
      if (!user) {
        setError('این شماره در سامانه ثبت نشده است. از حساب‌های نمونه استفاده کنید.');
        triggerShake();
        return;
      }
      goToOtp(user);
      notify('info', 'کد تأیید ارسال شد', 'کد نمایشی برای ورود: ۱۲۳۴۵');
    }, 800);
  };

  const handleDigit = (index: number, raw: string) => {
    const clean = toEnDigits(raw).replace(/\D/g, '');
    if (!clean) {
      setDigits((prev) => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }
    if (clean.length > 1) {
      const chars = clean.slice(0, 5 - index).split('');
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((ch, i) => {
          if (index + i < 5) next[index + i] = ch;
        });
        return next;
      });
      const last = Math.min(index + chars.length, 4);
      window.setTimeout(() => inputs.current[last]?.focus(), 10);
      return;
    }
    setDigits((prev) => prev.map((d, i) => (i === index ? clean : d)));
    if (index < 4) window.setTimeout(() => inputs.current[index + 1]?.focus(), 10);
    else inputs.current[index]?.blur();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 4) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = toEnDigits(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 5);
    if (!text) return;
    setDigits(Array.from({ length: 5 }, (_, i) => text[i] ?? ''));
    window.setTimeout(() => inputs.current[Math.min(text.length, 5) - 1]?.focus(), 10);
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 5) {
      setError('کد ۵ رقمی را کامل وارد کنید.');
      triggerShake();
      return;
    }
    setVerifying(true);
    setError('');
    window.setTimeout(() => {
      setVerifying(false);
      if (code !== DEMO_OTP) {
        setError('کد وارد شده صحیح نیست. کد نمایشی: ۱۲۳۴۵');
        triggerShake();
        setDigits(['', '', '', '', '']);
        inputs.current[0]?.focus();
        return;
      }
      if (pendingUser) {
        login(pendingUser.id);
        notify('success', `خوش آمدید ${pendingUser.name}`, `ورود موفق به ${panelMeta[pendingUser.role].title}`);
      }
    }, 700);
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(90);
    setDigits(['', '', '', '', '']);
    setError('');
    notify('info', 'کد تأیید دوباره ارسال شد', 'کد نمایشی: ۱۲۳۴۵');
    inputs.current[0]?.focus();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-base-200">
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-secondary/15 blur-3xl" />

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-2 text-xs font-medium text-base-content/70 shadow-sm backdrop-blur transition hover:text-base-content"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        {isDark ? 'حالت روشن' : 'حالت تاریک'}
      </button>

      <div className="relative mx-auto grid min-h-dvh max-w-7xl items-stretch gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-10">
        {/* Brand side */}
        <div className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-8 text-primary-content shadow-xl lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -left-20 top-20 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-black/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15 text-2xl font-black backdrop-blur">
              م
            </span>
            <div>
              <p className="text-lg font-extrabold">{CLINIC.name}</p>
              <p className="text-xs text-primary-content/70">{CLINIC.hospital}</p>
            </div>
          </div>

          <div className="relative mt-12 max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur">
              <Sparkles className="size-3.5" /> سامانه یکپارچه مدیریت کلینیک تخصصی
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.5]">
              مسیر بیمار، از پذیرش تا ترخیص؛
              <br />
              یک‌جا و هوشمند.
            </h1>
            <p className="mt-3 text-sm leading-7 text-primary-content/80">
              شش پنل تخصصی، فرایندهای به‌هم‌پیوسته و داشبوردهای زنده برای پزشکان، پرستاران،
              پذیرش، مالی و بیماران — بدون نیاز به زیرساخت پیچیده.
            </p>
          </div>

          <div className="relative mt-8 grid gap-2.5 sm:grid-cols-2">
            {Object.values(panelMeta).map((panel) => {
              const Icon = panel.icon;
              return (
                <div
                  key={panel.id}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs backdrop-blur-sm"
                >
                  <Icon className="size-4 shrink-0 opacity-90" />
                  <span className="truncate">{panel.title}</span>
                </div>
              );
            })}
          </div>

          <div className="relative mt-auto grid grid-cols-3 gap-3 pt-8">
            {[
              { value: '۸', label: 'پزشک متخصص' },
              { value: '۸', label: 'اتاق معاینه' },
              { value: '۹۸٪', label: 'رضایت مراجعین' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <p className="text-lg font-extrabold">{item.value}</p>
                <p className="text-[10px] text-primary-content/70">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="relative mt-5 flex items-center gap-1.5 text-[11px] text-primary-content/60">
            <ShieldCheck className="size-3.5" />
            نسخه نمایشی — داده‌ها فقط در همین مرورگر نگهداری می‌شوند
          </p>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-content">
                م
              </span>
              <div>
                <p className="font-extrabold">{CLINIC.name}</p>
                <p className="text-[11px] text-base-content/55">{CLINIC.hospital}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-base-300/80 bg-base-100 p-6 shadow-xl shadow-base-content/5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-base-content">
                    {step === 'phone' ? 'ورود به سامانه' : 'تأیید شماره موبایل'}
                  </h2>
                  <p className="mt-1 text-xs text-base-content/55">
                    {step === 'phone'
                      ? 'با شماره موبایل ثبت‌شده وارد شوید.'
                      : `کد ۵ رقمی ارسال‌شده به ${faDigits(phone.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3'))} را وارد کنید.`}
                  </p>
                </div>
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {step === 'phone' ? <Smartphone className="size-5" /> : <ShieldCheck className="size-5" />}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2">
                {['شماره موبایل', 'کد تأیید'].map((label, index) => {
                  const active = (step === 'phone' && index === 0) || (step === 'otp' && index === 1);
                  const done = step === 'otp' && index === 0;
                  return (
                    <div key={label} className="flex flex-1 items-center gap-2">
                      <span
                        className={cn(
                          'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition',
                          done && 'bg-success/15 text-success',
                          active && 'bg-primary text-primary-content',
                          !active && !done && 'bg-base-200 text-base-content/40',
                        )}
                      >
                        {done ? <CheckCircle2 className="size-3.5" /> : faDigits(index + 1)}
                      </span>
                      <span className={cn('text-[11px]', active ? 'font-semibold text-base-content' : 'text-base-content/45')}>
                        {label}
                      </span>
                      {index === 0 ? <span className="h-px flex-1 bg-base-300" /> : null}
                    </div>
                  );
                })}
              </div>

              {step === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className={cn('mt-6 space-y-4', shake && 'animate-shake')}>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-base-content/70">شماره موبایل</span>
                    <div className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <Smartphone className="size-4 text-base-content/40" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        dir="ltr"
                        autoFocus
                        value={phone}
                        onChange={(e) => {
                          setPhone(toEnDigits(e.target.value).replace(/[^\d]/g, '').slice(0, 11));
                          setError('');
                        }}
                        placeholder="09120000001"
                        className="w-full bg-transparent text-sm tracking-widest text-base-content outline-none placeholder:tracking-normal placeholder:text-base-content/30"
                      />
                      {phone ? (
                        <button type="button" onClick={() => setPhone('')} className="text-base-content/35 hover:text-base-content" aria-label="پاک کردن">
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </div>
                    <span className="mt-1.5 block text-[10px] text-base-content/40">
                      برای ورود دستی، شماره یکی از حساب‌های نمایشی را وارد کنید.
                    </span>
                  </label>

                  {error ? (
                    <p className="rounded-lg bg-error/10 px-3 py-2 text-[11px] leading-5 text-error">{error}</p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn btn-primary w-full gap-2 rounded-xl text-sm font-bold"
                  >
                    {sending ? (
                      <>
                        <span className="loading loading-spinner loading-xs" /> در حال ارسال کد...
                      </>
                    ) : (
                      <>
                        دریافت کد تأیید <ArrowLeft className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={verify} className="mt-6 space-y-4">
                  <div className={cn('flex justify-between gap-2', shake && 'animate-shake')} dir="ltr">
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputs.current[index] = el;
                        }}
                        value={digit ? faDigits(digit) : ''}
                        onChange={(e) => {
                          handleDigit(index, e.target.value);
                          setError('');
                        }}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label={`رقم ${index + 1} کد تأیید`}
                        className={cn(
                          'h-14 w-full rounded-xl border bg-base-100 text-center text-xl font-extrabold text-base-content outline-none transition',
                          error
                            ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/20'
                            : 'border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
                          digit && 'border-primary/50 bg-primary/5',
                        )}
                      />
                    ))}
                  </div>

                  {error ? (
                    <p className="rounded-lg bg-error/10 px-3 py-2 text-[11px] leading-5 text-error">{error}</p>
                  ) : null}

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-base-content/50">
                      <Clock3 className="size-3.5" />
                      {seconds > 0 ? `ارسال مجدد تا ${faDigits(seconds)} ثانیه` : 'کد را دریافت نکردید؟'}
                    </span>
                    <button
                      type="button"
                      onClick={resend}
                      disabled={seconds > 0}
                      className="font-semibold text-primary disabled:text-base-content/30"
                    >
                      ارسال مجدد
                    </button>
                  </div>

                  <button type="submit" disabled={verifying} className="btn btn-primary w-full gap-2 rounded-xl text-sm font-bold">
                    {verifying ? (
                      <>
                        <span className="loading loading-spinner loading-xs" /> در حال بررسی...
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="size-4" /> ورود به پنل
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setDigits(['', '', '', '', '']);
                        setError('');
                      }}
                      className="text-base-content/50 hover:text-base-content"
                    >
                      تغییر شماره موبایل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDigits(['1', '2', '3', '4', '5']);
                        setError('');
                        inputs.current[4]?.focus();
                      }}
                      className="rounded-md bg-base-200 px-2 py-1 font-medium text-base-content/60 hover:text-base-content"
                    >
                      کد نمایشی: ۱۲۳۴۵
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 rounded-xl border border-dashed border-base-300 bg-base-200/40 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-base-content/60">
                  <UserRoundCheck className="size-3.5" /> ورود سریع با حساب‌های نمایشی
                </p>
                <div className="grid gap-1.5">
                  {staffUsers.map((user) => {
                    const meta = panelMeta[user.role];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => goToOtp(user)}
                        className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-right transition hover:bg-base-100"
                      >
                        <Avatar name={user.name} size="xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-semibold text-base-content">{user.name}</span>
                          <span className="block truncate text-[10px] text-base-content/45">
                            {meta.shortTitle} — {user.title}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 rounded-md bg-base-200/80 px-1.5 py-0.5 text-[10px] text-base-content/50">
                          <Icon className="size-3" />
                          ورود
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] leading-5 text-base-content/40">
              {CLINIC.address} · {CLINIC.phone}
              <br />
              نسخه نمایشی {CLINIC.license}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
