import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  BedDouble,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  Siren,
  Timer,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { useApp } from '../../store/AppStore';
import { CLINIC, getPatient, patients } from '../../data/mock';
import { faDigits, uid } from '../../lib/utils';

type Level = 'قرمز' | 'نارنجی' | 'زرد' | 'سبز';

interface EmergencyCase {
  id: string;
  patientId: string;
  complaint: string;
  level: Level;
  time: string;
  status: 'در حال اقدام' | 'منتقل شد';
  vitals: string;
  nurse: string;
}

const levelTone: Record<Level, 'error' | 'warning' | 'info' | 'success'> = {
  قرمز: 'error',
  نارنجی: 'warning',
  زرد: 'info',
  سبز: 'success',
};

export function NursingEmergency() {
  const { user, notify } = useApp();
  const [cases, setCases] = useState<EmergencyCase[]>([
    {
      id: uid('em'),
      patientId: 'p5',
      complaint: 'تب ۳۹ درجه و تنگی نفس خفیف',
      level: 'نارنجی',
      time: '۱۰:۱۵',
      status: 'در حال اقدام',
      vitals: 'BP ۱۰۵/۶۸ · PR ۱۰۲ · SpO₂ ۹۷٪',
      nurse: 'زهرا موسوی',
    },
  ]);
  const [patientId, setPatientId] = useState('p3');
  const [complaint, setComplaint] = useState('');
  const [level, setLevel] = useState<Level>('زرد');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) {
      notify('warning', 'شرح وضعیت بیمار را وارد کنید');
      return;
    }
    const time = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    const newCase: EmergencyCase = {
      id: uid('em'),
      patientId,
      complaint,
      level,
      time,
      status: 'در حال اقدام',
      vitals: `BP ${faDigits(bp || '—')} · PR ${faDigits(pulse || '—')} · SpO₂ ${faDigits(spo2 || '—')}٪`,
      nurse: user?.name ?? 'پرستار',
    };
    setCases((list) => [newCase, ...list]);
    notify('error', 'بیمار اورژانسی ثبت شد', `سطح ${level} — تیم پزشکی مطلع شد.`);
    setComplaint('');
    setBp('');
    setPulse('');
    setSpo2('');
  };

  const transfer = (id: string) => {
    setCases((list) => list.map((c) => (c.id === id ? { ...c, status: 'منتقل شد' } : c)));
    notify('warning', 'درخواست انتقال به اورژانس اصلی ارسال شد', 'تیم انتقال بیمارستان در مسیر است.');
  };

  const active = cases.filter((c) => c.status === 'در حال اقدام').length;
  const transferred = cases.filter((c) => c.status === 'منتقل شد').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="اورژانس سرپایی"
        description="مدیریت اقدامات اولیه برای بیماران بدحال پیش از انتقال به اورژانس اصلی بیمارستان."
        badge={<Badge tone="error" dot>وضعیت آماده‌باش</Badge>}
        actions={
          <a href={`tel:${'02188776600'}`} className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs">
            <PhoneCall className="size-3.5 text-error" /> تماس با اورژانس اصلی
          </a>
        }
      />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-error via-rose-600 to-rose-500 p-4 text-white shadow-md sm:p-5">
        <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold">
              <Siren className="size-4 animate-pulse-soft" /> پروتکل اقدام سریع — ABC
            </p>
            <p className="mt-1 text-[11px] leading-6 text-white/80">
              ارزیابی راه هوایی، تنفس و گردش خون → اطلاع فوری به پزشک کشیک → ثبت علائم حیاتی → آماده‌سازی انتقال.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
            <Timer className="size-5" />
            <div>
              <p className="text-[10px] text-white/70">زمان هدف پاسخ</p>
              <p className="text-sm font-extrabold">کمتر از ۳ دقیقه</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="موارد امروز" value={faDigits(cases.length)} icon={Ambulance} tone="rose" hint="مراجعه اورژانسی سرپایی" />
        <StatCard label="در حال اقدام" value={faDigits(active)} icon={ShieldAlert} tone="amber" hint="تحت مراقبه پرستاری" />
        <StatCard label="منتقل‌شده" value={faDigits(transferred)} icon={BedDouble} tone="sky" hint="به اورژانس اصلی" />
        <StatCard label="میانگین زمان پاسخ" value="۲ دقیقه" icon={Timer} tone="emerald" hint="هدف: زیر ۳ دقیقه" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="ثبت بیمار اورژانسی" subtitle="اقدام اولیه و سطح‌بندی تریاژ" icon={AlertTriangle} />
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="بیمار" required>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={selectClass}>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.insurance}</option>
                  ))}
                </select>
              </Field>
              <Field label="سطح تریاژ" required>
                <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={selectClass}>
                  <option value="قرمز">قرمز — نیازمند احیای فوری</option>
                  <option value="نارنجی">نارنجی — فوری</option>
                  <option value="زرد">زرد — نیمه‌فوری</option>
                  <option value="سبز">سبز — غیرفوری</option>
                </select>
              </Field>
            </div>
            <Field label="شرح وضعیت و شکایت اصلی" required>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={2}
                placeholder="مثال: درد قفسه سینه از نیم ساعت پیش، تعریق سرد..."
                className={`${inputClass} resize-none`}
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="فشار خون">
                <input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="۱۲۰/۸۰" className={`${inputClass} text-center`} dir="ltr" />
              </Field>
              <Field label="نبض">
                <input value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="۹۸" className={`${inputClass} text-center`} dir="ltr" />
              </Field>
              <Field label="SpO₂ (٪)">
                <input value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="۹۶" className={`${inputClass} text-center`} dir="ltr" />
              </Field>
            </div>
            <button type="submit" className="btn btn-sm w-full gap-1.5 rounded-xl bg-error text-xs text-error-content hover:bg-error/90">
              <Siren className="size-3.5" /> ثبت و اعلام به تیم پزشکی
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="تماس‌های اضطراری" subtitle="داخلی‌های بیمارستان" icon={PhoneCall} />
            <div className="space-y-1.5 text-[11px]">
              {[
                ['اورژانس اصلی بیمارستان', '۲۲۰۰', 'text-error'],
                ['پزشک کشیک کلینیک', '۲۲۴۵', 'text-primary'],
                ['تیم انتقال بیمار', '۲۲۷۰', 'text-sky-600'],
                ['مدیریت پرستاری', '۲۲۱۰', 'text-amber-600'],
              ].map(([label, ext, tone]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-base-200/50 px-2.5 py-2">
                  <span className="text-base-content/60">{label}</span>
                  <span className={`font-bold ${tone}`} dir="ltr">{ext}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[9px] text-base-content/35">{CLINIC.phone} · داخلی ۲۲۰۰</p>
          </Card>

          <Card className="bg-error/5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-error">
              <AlertTriangle className="size-4" /> هشدار ایمنی
            </p>
            <p className="mt-1.5 text-[10px] leading-6 text-base-content/60">
              در موارد درد قفسه سینه، اختلال هوشیاری یا تنگی نفس شدید، انتقال به اورژانس اصلی بدون تأخیر انجام شود.
              اقدامات پرستاری جایگزین ویزیت پزشک نیست.
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="موارد فعال اورژانس سرپایی"
          subtitle="پیگیری وضعیت بیماران بدحال"
          icon={HeartPulse}
          action={<Badge tone="error">{faDigits(active)} در حال اقدام</Badge>}
        />
        <div className="space-y-2">
          {cases.map((item) => {
            const patient = getPatient(item.patientId);
            return (
              <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-base-300/60 p-3 sm:flex-row sm:items-center">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-error/10 text-error">
                  <Siren className="size-4" />
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <Avatar name={patient?.name ?? ''} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-base-content">{patient?.name}</p>
                    <p className="truncate text-[10px] text-base-content/45">{item.complaint}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={levelTone[item.level]}>تریاژ {item.level}</Badge>
                  <Badge tone="neutral">{item.time}</Badge>
                  <Badge tone={item.status === 'منتقل شد' ? 'success' : 'warning'} dot>{item.status}</Badge>
                  <span className="hidden text-[9px] text-base-content/35 sm:inline">{item.vitals}</span>
                  {item.status === 'در حال اقدام' ? (
                    <button
                      type="button"
                      onClick={() => transfer(item.id)}
                      className="flex items-center gap-1 rounded-lg bg-error px-2 py-1 text-[10px] font-medium text-error-content hover:bg-error/90"
                    >
                      انتقال <ArrowLeft className="size-3" />
                    </button>
                  ) : (
                    <span className="text-[9px] text-success">تحویل اورژانس</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[9px] text-base-content/35">
          <UserRound className="size-3" /> ثبت‌کننده: {user?.name} — مسئول شیفت پرستاری
        </p>
      </Card>
    </div>
  );
}
