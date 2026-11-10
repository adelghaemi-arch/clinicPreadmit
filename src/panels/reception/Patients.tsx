import { useMemo, useState, type FormEvent } from 'react';
import {
  CalendarPlus,
  FilePlus2,
  FolderOpen,
  Phone,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { faDigits, faShortDate, num, toEnDigits, todayIso } from '../../lib/utils';
import { InsuranceChip } from '../../components/clinic/ClinicBits';
import type { InsuranceKind, Patient } from '../../types';

const insuranceOptions: InsuranceKind[] = ['تأمین اجتماعی', 'بیمه سلامت', 'آزاد', 'نیروهای مسلح'];

const emptyForm = {
  name: '',
  nationalId: '',
  phone: '',
  birthDate: '1990-01-01',
  gender: 'زن' as 'زن' | 'مرد',
  insurance: 'تأمین اجتماعی' as InsuranceKind,
  supplementary: '',
  blood: 'O+',
  allergies: '',
};

export function ReceptionPatients() {
  const {
    patients,
    appointments,
    visits,
    addPatient,
    setFocusPatient,
    setPage,
    notify,
  } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.includes(q) ||
        p.nationalId.includes(toEnDigits(q)) ||
        p.phone.includes(toEnDigits(q)) ||
        p.fileNo.includes(toEnDigits(q)),
    );
  }, [patients, query]);

  const today = todayIso();
  const newToday = patients.filter((p) => p.createdAt === today).length;
  const insured = patients.filter((p) => p.insurance !== 'آزاد').length;

  const resetForm = () => {
    setForm(emptyForm);
    setError('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const nationalId = toEnDigits(form.nationalId).replace(/\D/g, '');
    const phone = toEnDigits(form.phone).replace(/\D/g, '');
    if (!form.name.trim() || nationalId.length !== 10 || phone.length !== 11) {
      setError('نام، کد ملی ۱۰ رقمی و شماره موبایل ۱۱ رقمی را کامل وارد کنید.');
      return;
    }
    if (patients.some((p) => p.nationalId === nationalId)) {
      setError('بیماری با این کد ملی قبلاً در سامانه ثبت شده است.');
      return;
    }
    const birthYear = new Date(form.birthDate).getFullYear();
    const age = Math.max(new Date().getFullYear() - birthYear, 0);
    const created = addPatient({
      name: form.name.trim(),
      nationalId,
      phone,
      birthDate: form.birthDate,
      age,
      gender: form.gender,
      insurance: form.insurance,
      supplementary: form.supplementary || '—',
      blood: form.blood,
      allergies: form.allergies
        .split(/[،,]/)
        .map((a) => a.trim())
        .filter(Boolean),
    });
    notify('success', 'پرونده جدید تشکیل شد', `${created.name} — شماره پرونده ${created.fileNo}`);
    setFocusPatient(created.id);
    setCreateOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="جستجو و تشکیل پرونده"
        description="ثبت‌احوال هوشمند بیماران، جستجو با کد ملی یا شماره تماس و تشکیل پرونده الکترونیک."
        badge={<Badge tone="info" dot>اتصال به ثبت احوال</Badge>}
        actions={
          <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
            <FilePlus2 className="size-3.5" /> تشکیل پرونده جدید
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="کل پرونده‌های فعال" value={num(patients.length)} icon={FolderOpen} tone="sky" hint="در کلینیک‌های تخصصی" />
        <StatCard label="پرونده‌های امروز" value={num(newToday)} icon={UserPlus} tone="teal" hint="ثبت‌شده در پذیرش" />
        <StatCard label="بیماران بیمه‌شده" value={`${num(Math.round((insured / patients.length) * 100))}٪`} icon={ShieldCheck} tone="emerald" hint={`${faDigits(insured)} نفر دارای بیمه پایه`} />
        <StatCard label="مراجعین امروز" value={num(appointments.filter((a) => a.date === today).length)} icon={CalendarPlus} tone="amber" hint="در همه تخصص‌ها" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-base-content/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو با نام، کد ملی، شماره تماس یا شماره پرونده..."
              className={`${inputClass} pr-9`}
            />
          </div>
          <Badge tone="neutral">{faDigits(filtered.length)} پرونده</Badge>
          <Badge tone="success" dot>جستجوی زنده</Badge>
        </div>

        {filtered.length ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((patient) => {
              const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
              const lastAppointment = patientAppointments.sort((a, b) => b.date.localeCompare(a.date))[0];
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelected(patient)}
                  className="rounded-xl border border-base-300/70 p-3 text-right transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar name={patient.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-base-content">{patient.name}</p>
                      <p className="mt-0.5 text-[10px] text-base-content/45">
                        پرونده {patient.fileNo} · {faDigits(patient.age)} ساله
                      </p>
                    </div>
                    <Badge tone="neutral">{patient.blood}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <InsuranceChip kind={patient.insurance} />
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-base-300/50 pt-2 text-[9px] text-base-content/40">
                    <span className="flex items-center gap-1"><Phone className="size-2.5" /> {faDigits(patient.phone)}</span>
                    <span>{lastAppointment ? `آخرین مراجعه: ${faShortDate(lastAppointment.date)}` : 'بدون مراجعه'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="بیماری با این مشخصات یافت نشد"
            description="می‌توانید با تغییر عبارت جستجو یا تشکیل پرونده جدید ادامه دهید."
            action={
              <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-sm btn-primary rounded-xl text-xs">
                تشکیل پرونده جدید
              </button>
            }
          />
        )}
      </Card>

      {/* Patient detail */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        description={selected ? `شماره پرونده ${selected.fileNo}` : undefined}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs" onClick={() => notify('info', 'ویرایش اطلاعات', 'فرم ویرایش در نسخه نمایشی غیرفعال است.')}>
              ویرایش اطلاعات
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
              onClick={() => {
                if (selected) setFocusPatient(selected.id);
                setSelected(null);
                setPage('scheduling');
              }}
            >
              <CalendarPlus className="size-3.5" /> نوبت‌دهی برای این بیمار
            </button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-base-200/60 p-3">
              <Avatar name={selected.name} size="lg" />
              <div>
                <p className="text-sm font-bold text-base-content">{selected.name}</p>
                <p className="mt-0.5 text-[11px] text-base-content/50">
                  {faDigits(selected.age)} ساله · {selected.gender} · گروه خونی {selected.blood}
                </p>
                <div className="mt-1">
                  <InsuranceChip kind={selected.insurance} supplementary={selected.supplementary} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['کد ملی', faDigits(selected.nationalId)],
                ['شماره تماس', faDigits(selected.phone)],
                ['تاریخ تولد', selected.birthDate],
                ['تاریخ تشکیل پرونده', selected.createdAt],
                ['تعداد ویزیت', `${num(visits.filter((v) => v.patientId === selected.id).length)} مورد`],
                ['نوبت‌های فعال', `${num(appointments.filter((a) => a.patientId === selected.id && a.status !== 'done' && a.status !== 'canceled').length)} نوبت`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-base-300/60 px-3 py-2">
                  <p className="text-[10px] text-base-content/45">{label}</p>
                  <p className="mt-0.5 font-medium text-base-content">{value}</p>
                </div>
              ))}
            </div>

            {selected.allergies.length ? (
              <p className="rounded-lg bg-error/5 px-3 py-2 text-[11px] text-error">
                حساسیت‌ها: {selected.allergies.join('، ')}
              </p>
            ) : (
              <p className="rounded-lg bg-success/5 px-3 py-2 text-[11px] text-success">
                حساسیت دارویی ثبت نشده است.
              </p>
            )}

            <div>
              <p className="mb-2 text-[11px] font-semibold text-base-content/60">آخرین نوبت‌ها</p>
              {appointments.filter((a) => a.patientId === selected.id).length ? (
                <div className="space-y-1.5">
                  {appointments
                    .filter((a) => a.patientId === selected.id)
                    .slice(-3)
                    .reverse()
                    .map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-base-200/50 px-2.5 py-1.5 text-[10px]">
                        <span className="text-base-content/60">{faShortDate(a.date)} — {a.time}</span>
                        <span>{a.type}</span>
                        <Badge tone={a.status === 'done' ? 'success' : a.status === 'canceled' ? 'error' : 'warning'}>
                          {a.status === 'done' ? 'ویزیت شد' : a.status === 'canceled' ? 'لغو' : 'فعال'}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[10px] text-base-content/40">سابقه نوبتی ثبت نشده است.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Create patient */}
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetForm();
        }}
        title="تشکیل پرونده بیمار جدید"
        description="اطلاعات هویتی و بیمه‌ای بیمار را وارد کنید"
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-sm rounded-xl border-base-300 bg-base-100 text-xs" onClick={() => setCreateOpen(false)}>
              انصراف
            </button>
            <button type="submit" form="new-patient-form" className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
              <FilePlus2 className="size-3.5" /> ثبت پرونده
            </button>
          </>
        }
      >
        <form id="new-patient-form" onSubmit={submit} className="space-y-3">
          {error ? (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-[11px] text-error">{error}</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" required>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="مثال: سارا رضایی" />
            </Field>
            <Field label="کد ملی" required hint="۱۰ رقم بدون خط تیره">
              <input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className={`${inputClass} tracking-widest`} placeholder="0012345678" dir="ltr" inputMode="numeric" />
            </Field>
            <Field label="شماره موبایل" required>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass} tracking-wider`} placeholder="09123456789" dir="ltr" inputMode="tel" />
            </Field>
            <Field label="تاریخ تولد">
              <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputClass} dir="ltr" />
            </Field>
            <Field label="جنسیت">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'زن' | 'مرد' })} className={selectClass}>
                <option value="زن">زن</option>
                <option value="مرد">مرد</option>
              </select>
            </Field>
            <Field label="گروه خونی">
              <select value={form.blood} onChange={(e) => setForm({ ...form, blood: e.target.value })} className={selectClass}>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="بیمه پایه">
              <select value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value as InsuranceKind })} className={selectClass}>
                {insuranceOptions.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="بیمه تکمیلی">
              <input value={form.supplementary} onChange={(e) => setForm({ ...form, supplementary: e.target.value })} className={inputClass} placeholder="اختیاری — مثال: بیمه دانا" />
            </Field>
          </div>
          <Field label="حساسیت دارویی" hint="در صورت تعدد، با ویرگول جدا کنید">
            <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className={inputClass} placeholder="مثال: پنی‌سیلین، لاتکس" />
          </Field>
          <div className="rounded-lg bg-info/5 px-3 py-2 text-[10px] leading-5 text-info">
            با ثبت اطلاعات، پرونده در صف پذیرش ایجاد می‌شود. استعلام بیمه در مرحله پذیرش روز انجام خواهد شد.
          </div>
        </form>
      </Modal>

      <Card>
        <CardHeader title="راهنمای پذیرش" subtitle="فرایند استاندارد تشکیل پرونده" icon={ShieldCheck} />
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ['۱', 'جستجوی بیمار', 'ابتدا با کد ملی جستجو کنید تا از پرونده تکراری جلوگیری شود.'],
            ['۲', 'ثبت اطلاعات', 'مشخصات هویتی، تماس و پوشش بیمه‌ای را تکمیل کنید.'],
            ['۳', 'نوبت‌دهی', 'پس از تشکیل پرونده، نوبت پزشک متخصص را رزرو کنید.'],
          ].map(([step, title, desc]) => (
            <div key={step} className="rounded-xl border border-base-300/60 p-3">
              <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{step}</span>
              <p className="mt-1.5 text-[11px] font-semibold text-base-content">{title}</p>
              <p className="mt-0.5 text-[10px] leading-5 text-base-content/45">{desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
