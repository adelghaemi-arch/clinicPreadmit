import { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  CalendarPlus,
  Check,
  ChevronLeft,
  Clock3,
  Info,
  Phone,
  Star,
  Stethoscope,
  Users,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { useApp } from '../../store/AppStore';
import { doctors, getDoctor, getPatient, timeSlots } from '../../data/mock';
import { splitFee, buildVisitInvoice } from '../../lib/billing';
import {
  addDays,
  faDigits,
  faShortDate,
  faWeekday,
  money,
  todayIso,
} from '../../lib/utils';
import type { Appointment, AppointmentType } from '../../types';
import { AppointmentStatusBadge } from '../../components/clinic/ClinicBits';

const types: AppointmentType[] = ['ویزیت اول', 'ویزیت مجدد', 'مشاوره', 'پیگیری'];

export function ReceptionScheduling() {
  const {
    patients,
    appointments,
    focusPatientId,
    bookAppointment,
    addInvoice,
    setPage,
    notify,
    user,
  } = useApp();
  const today = todayIso();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);

  const [patientId, setPatientId] = useState(focusPatientId ?? patients[0]?.id ?? 'p1');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? 'd1');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [type, setType] = useState<AppointmentType>('ویزیت اول');
  const [source, setSource] = useState<'حضوری' | 'تلفنی' | 'آنلاین'>('حضوری');
  const [note, setNote] = useState('');
  const [booked, setBooked] = useState<Appointment | null>(null);

  const patient = getPatient(patientId);
  const doctor = getDoctor(doctorId);
  const feeSplit = patient && doctor ? splitFee(doctor.visitFee, patient) : null;

  const dayAppointments = appointments
    .filter((a) => a.doctorId === doctorId && a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
  const takenTimes = new Set(
    dayAppointments.filter((a) => a.status !== 'canceled').map((a) => a.time),
  );
  const nextQueue =
    appointments
      .filter((a) => a.date === date)
      .reduce((max, a) => Math.max(max, a.queueNo), 0) + 1;

  const book = () => {
    if (!patient || !doctor) return;
    if (!time) {
      notify('warning', 'ساعت نوبت را انتخاب کنید', 'یکی از ساعت‌های آزاد پزشک را انتخاب نمایید.');
      return;
    }
    if (takenTimes.has(time)) {
      notify('error', 'این ساعت رزرو شده است', 'ساعت دیگری را انتخاب کنید.');
      return;
    }
    const appointment = bookAppointment({
      patientId,
      doctorId,
      date,
      time,
      type,
      source,
      note: note || undefined,
    });
    addInvoice(buildVisitInvoice(doctor, patient, date));
    setBooked(appointment);
    setTime('');
    setNote('');
    notify(
      'success',
      'نوبت با موفقیت ثبت شد',
      `${patient.name} — ${doctor.name} — ${faShortDate(date)} ساعت ${faDigits(time)}`,
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="نوبت‌دهی و تقویم"
        description="رزرو نوبت حضوری، تلفنی و اینترنتی با مدیریت ظرفیت و لیست انتظار."
        badge={<Badge tone="info" dot>ظرفیت زنده</Badge>}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-[11px] text-base-content/60">
            <Phone className="size-3.5 text-primary" />
            پذیرش تلفنی: {faDigits('02188776622')}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader title="انتخاب پزشک" subtitle="پزشکان حاضر در کلینیک و تعرفه ویزیت" icon={Stethoscope} />
            <div className="grid gap-2 sm:grid-cols-2">
              {doctors.map((doc) => {
                const active = doc.id === doctorId;
                const docDayCount = appointments.filter(
                  (a) => a.doctorId === doc.id && a.date === date && a.status !== 'canceled',
                ).length;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setDoctorId(doc.id);
                      setTime('');
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-right transition ${
                      active
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-base-300/70 hover:border-primary/40 hover:bg-base-200/40'
                    }`}
                  >
                    <Avatar name={doc.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-base-content">{doc.name}</p>
                      <p className="text-[10px] text-base-content/45">{doc.specialty}</p>
                      <div className="mt-1 flex items-center gap-2 text-[9px] text-base-content/40">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="size-2.5 fill-amber-400 text-amber-400" /> {faDigits(doc.rating)}
                        </span>
                        <span>{money(doc.visitFee)}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] text-base-content/35">ظرفیت</p>
                      <p className="text-[10px] font-semibold text-base-content/60">
                        {faDigits(docDayCount)} از {faDigits(doc.capacity)}
                      </p>
                    </div>
                    {active ? <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-content"><Check className="size-3" /></span> : null}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="زمان و بیمار"
              subtitle={`${doctor?.name} — ${doctor?.room}`}
              icon={CalendarPlus}
              action={<Badge tone="neutral">شماره صف بعدی: {faDigits(nextQueue)}</Badge>}
            />
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-medium text-base-content/60">تاریخ مراجعه</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {days.map((day) => {
                    const active = day === date;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setDate(day);
                          setTime('');
                        }}
                        className={`min-w-16 shrink-0 rounded-xl border px-2 py-3 text-center transition ${
                          active
                            ? 'border-primary bg-primary text-primary-content shadow-sm'
                            : 'border-base-300/70 text-base-content/60 hover:bg-base-200'
                        }`}
                      >
                        <span className={`block text-[9px] ${active ? 'text-primary-content/70' : 'text-base-content/35'}`}>
                          {day === today ? 'امروز' : faWeekday(day)}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-bold">{faShortDate(day)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-base-content/60">ساعت نوبت</p>
                  <span className="flex items-center gap-1 text-[9px] text-base-content/40">
                    <Clock3 className="size-3" /> {faDigits(timeSlots.length - takenTimes.size)} ساعت آزاد
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5" dir="ltr">
                  {timeSlots.map((slot) => {
                    const taken = takenTimes.has(slot);
                    const active = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={taken}
                        onClick={() => setTime(slot)}
                        className={`rounded-lg border py-1.5 text-[10px] font-medium tabular-nums transition ${
                          taken
                            ? 'cursor-not-allowed border-base-200 bg-base-200/60 text-base-content/25 line-through'
                            : active
                              ? 'border-primary bg-primary text-primary-content'
                              : 'border-base-300/70 text-base-content/60 hover:border-primary/40 hover:bg-primary/5'
                        }`}
                        dir="ltr"
                      >
                        {faDigits(slot)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[9px] text-base-content/35">
                  <Info className="size-3" /> ساعت‌های خط‌خورده قبلاً رزرو شده‌اند.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="بیمار" required>
                  <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={selectClass}>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.insurance}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="نوع ویزیت">
                  <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)} className={selectClass}>
                    {types.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="منبع نوبت">
                  <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className={selectClass}>
                    <option>حضوری</option>
                    <option>تلفنی</option>
                    <option>آنلاین</option>
                  </select>
                </Field>
                <Field label="توضیح برای پزشک">
                  <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="اختیاری..." />
                </Field>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-8 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />
            <CardHeader title="خلاصه رزرو" subtitle="محاسبه خودکار سهم بیمه و بیمار" icon={Wallet} />
            {patient && doctor && feeSplit ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-base-200/60 p-2">
                  <Avatar name={patient.name} size="xs" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-base-content">{patient.name}</p>
                    <p className="text-[9px] text-base-content/45">{patient.insurance}{patient.supplementary !== '—' ? ` + ${patient.supplementary}` : ''}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-base-content/50">تعرفه ویزیت</span>
                    <span className="font-medium">{money(doctor.visitFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/50">سهم بیمه پایه</span>
                    <span className="font-medium text-success">− {money(feeSplit.insuranceShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/50">سهم بیمه تکمیلی</span>
                    <span className="font-medium text-info">− {money(feeSplit.supplementaryShare)}</span>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-dashed border-base-300 pt-2 text-xs">
                    <span className="font-semibold text-base-content">پرداختی بیمار</span>
                    <span className="font-extrabold text-primary">{money(feeSplit.patientShare)}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-base-200/60 px-2.5 py-2 text-[10px] leading-5 text-base-content/50">
                  {date === today ? 'امروز' : faShortDate(date)} · ساعت {time ? faDigits(time) : 'انتخاب نشده'} · {type}
                </div>
                <button type="button" onClick={book} className="btn btn-primary btn-sm w-full rounded-xl text-xs">
                  <CalendarCheck2 className="size-4" /> ثبت نهایی نوبت
                </button>
                <p className="text-center text-[9px] text-base-content/35">
                  فاکتور به‌صورت خودکار برای صندوق صادر می‌شود.
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-base-content/40">بیمار و پزشک را انتخاب کنید.</p>
            )}
          </Card>

          <Card>
            <CardHeader
              title="نوبت‌های این روز"
              subtitle={`${doctor?.name} — ${faShortDate(date)}`}
              icon={Users}
              action={<Badge tone="info">{faDigits(dayAppointments.length)} نوبت</Badge>}
            />
            {dayAppointments.length ? (
              <div className="max-h-80 space-y-1.5 overflow-y-auto">
                {dayAppointments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-lg bg-base-200/40 px-2 py-1.5">
                    <span className="w-8 shrink-0 text-center text-[9px] font-medium tabular-nums text-base-content/50" dir="ltr">
                      {faDigits(a.time)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-base-content">{getPatient(a.patientId)?.name}</p>
                      <p className="text-[8px] text-base-content/35">شماره صف {faDigits(a.queueNo)}</p>
                    </div>
                    <AppointmentStatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-base-200/40 px-3 py-4 text-center text-[10px] text-base-content/40">
                برای این روز نوبتی ثبت نشده است.
              </p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(booked)}
        onClose={() => setBooked(null)}
        title="نوبت با موفقیت ثبت شد"
        description="اطلاعات نوبت و فاکتور صادرشده"
        footer={
          <>
            <button type="button" onClick={() => setBooked(null)} className="btn btn-sm rounded-xl border-base-300 bg-base-100 text-xs">
              رزرو نوبت بعدی
            </button>
            <button
              type="button"
              onClick={() => {
                setBooked(null);
                setPage('admission');
              }}
              className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
            >
              رفتن به پذیرش روز <ChevronLeft className="size-3.5" />
            </button>
          </>
        }
      >
        {booked ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-success/5 p-3 text-center">
              <p className="text-[10px] text-base-content/45">شماره صف</p>
              <p className="text-3xl font-extrabold text-success">{faDigits(booked.queueNo)}</p>
              <p className="mt-1 text-[10px] text-base-content/50">
                {faShortDate(booked.date)} — ساعت {faDigits(booked.time)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['بیمار', getPatient(booked.patientId)?.name ?? '—'],
                ['پزشک', getDoctor(booked.doctorId)?.name ?? '—'],
                ['اتاق', booked.room],
                ['نوع ویزیت', booked.type],
                ['منبع', booked.source],
                ['ثبت‌کننده', user?.name ?? 'پذیرش'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-base-300/60 px-2.5 py-1.5">
                  <p className="text-[9px] text-base-content/40">{label}</p>
                  <p className="mt-0.5 font-medium text-base-content">{value}</p>
                </div>
              ))}
            </div>
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-[10px] leading-5 text-warning">
              فاکتور نوبت در صندوق ثبت شد؛ بیمار برای تسویه به صندوق ارجاع داده می‌شود.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
