import { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  CalendarPlus,
  Check,
  ChevronLeft,
  Clock3,
  CreditCard,
  ShieldCheck,
  Star,
  Stethoscope,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { doctors, getDoctor, getPatient, timeSlots } from '../../data/mock';
import { buildVisitInvoice, splitFee } from '../../lib/billing';
import { addDays, faDigits, faShortDate, faWeekday, money, todayIso } from '../../lib/utils';
import type { Appointment, Invoice } from '../../types';

interface Checkout {
  appointment: Appointment;
  invoice: Invoice;
  paid: boolean;
}

export function PatientBook() {
  const {
    user,
    patients,
    appointments,
    invoices,
    bookAppointment,
    addInvoice,
    payInvoice,
    updateAppointment,
    setPage,
    notify,
  } = useApp();
  const today = todayIso();
  const patientId = user?.patientId ?? patients[0]?.id ?? 'p1';
  const patient = getPatient(patientId);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);
  const specialties = Array.from(new Set(doctors.map((d) => d.specialty)));

  const [specialty, setSpecialty] = useState('همه');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? 'd1');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [checkout, setCheckout] = useState<Checkout | null>(null);

  const visibleDoctors = doctors.filter((d) => specialty === 'همه' || d.specialty === specialty);
  const doctor = getDoctor(doctorId);
  const taken = new Set(
    appointments
      .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'canceled')
      .map((a) => a.time),
  );
  const split = patient && doctor ? splitFee(doctor.visitFee, patient) : null;
  const myUpcoming = appointments
    .filter(
      (a) =>
        a.patientId === patientId &&
        a.date >= today &&
        a.status !== 'canceled' &&
        a.status !== 'done',
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const reserve = () => {
    if (!patient || !doctor) return;
    if (!time) {
      notify('warning', 'ساعت ویزیت را انتخاب کنید');
      return;
    }
    const appointment = bookAppointment({
      patientId,
      doctorId,
      date,
      time,
      type: 'ویزیت اول',
      source: 'آنلاین',
    });
    const invoice = addInvoice(buildVisitInvoice(doctor, patient, date));
    setCheckout({ appointment, invoice, paid: false });
    setTime('');
    notify('info', 'نوبت رزرو شد', 'برای قطعی‌شدن نوبت، هزینه ویزیت را پرداخت کنید.');
  };

  const pay = () => {
    if (!checkout) return;
    payInvoice(checkout.invoice.id, 'درگاه آنلاین');
    updateAppointment(checkout.appointment.id, { paid: true });
    setCheckout({ ...checkout, paid: true });
    notify('success', 'پرداخت با موفقیت انجام شد', `نوبت ${faDigits(checkout.appointment.queueNo)} قطعی شد.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="نوبت‌دهی آنلاین"
        description={`${patient?.name} — انتخاب تخصص، پزشک، تاریخ و ساعت ویزیت با پرداخت آنلاین`}
        badge={<Badge tone="success" dot>پذیرش ۲۴ ساعته</Badge>}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader title="۱. انتخاب تخصص" subtitle="خدمات تخصصی و فوق‌تخصصی کلینیک" icon={Stethoscope} />
            <div className="flex flex-wrap gap-1.5">
              {['همه', ...specialties].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSpecialty(item)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                    specialty === item
                      ? 'border-primary bg-primary/10 font-medium text-primary'
                      : 'border-base-300 text-base-content/55 hover:bg-base-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="۲. انتخاب پزشک" subtitle="پزشکان دارای نوبت آزاد" icon={CalendarPlus} />
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleDoctors.map((doc) => {
                const active = doc.id === doctorId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setDoctorId(doc.id);
                      setTime('');
                    }}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-right transition ${
                      active ? 'border-primary bg-primary/5' : 'border-base-300/70 hover:bg-base-200/40'
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
                        <span>{doc.room}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] text-base-content/35">ویزیت</p>
                      <p className="text-[10px] font-semibold text-base-content/60">{money(doc.visitFee)}</p>
                    </div>
                    {active ? <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-content"><Check className="size-3" /></span> : null}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="۳. تاریخ و ساعت" subtitle={`${doctor?.name} — ${doctor?.room}`} icon={Clock3} />
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
                        ? 'border-primary bg-primary text-primary-content'
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

            <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-5" dir="ltr">
              {timeSlots.map((slot) => {
                const busy = taken.has(slot);
                const active = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={busy}
                    onClick={() => setTime(slot)}
                    className={`rounded-lg border py-2 text-[10px] font-medium tabular-nums transition ${
                      busy
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
            <p className="mt-2 flex items-center gap-1 text-[9px] text-base-content/35">
              <ShieldCheck className="size-3" /> زمان‌های خط‌خورده تکمیل شده‌اند.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-8 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />
            <CardHeader title="خلاصه رزرو" subtitle="پرداخت آنلاین و قطعی‌شدن نوبت" icon={Wallet} />
            {doctor && split ? (
              <>
                <div className="rounded-xl bg-base-200/60 p-3 text-center">
                  <p className="text-[10px] text-base-content/45">{doctor.specialty}</p>
                  <p className="mt-0.5 text-xs font-bold text-base-content">{doctor.name}</p>
                  <p className="mt-1 text-[10px] text-base-content/50">
                    {date === today ? 'امروز' : faShortDate(date)} · {time ? `ساعت ${faDigits(time)}` : 'ساعت انتخاب نشده'}
                  </p>
                </div>
                <div className="mt-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-base-content/50">تعرفه ویزیت</span>
                    <span className="font-medium">{money(doctor.visitFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/50">سهم بیمه {patient?.insurance}</span>
                    <span className="text-success">− {money(split.insuranceShare)}</span>
                  </div>
                  {split.supplementaryShare > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-base-content/50">سهم بیمه تکمیلی</span>
                      <span className="text-info">− {money(split.supplementaryShare)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between rounded-lg bg-primary/5 px-2 py-2 text-xs">
                    <span className="font-semibold">پرداختی شما</span>
                    <span className="font-extrabold text-primary">{money(split.patientShare)}</span>
                  </div>
                </div>
                <button type="button" onClick={reserve} className="btn btn-primary btn-sm mt-3 w-full gap-1.5 rounded-xl text-xs">
                  <CreditCard className="size-4" /> رزرو و پرداخت آنلاین
                </button>
                <p className="mt-2 text-center text-[9px] leading-5 text-base-content/35">
                  با رزرو نوبت، قوانین لغو و بازگشت وجه کلینیک را می‌پذیرید.
                </p>
              </>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="نوبت‌های آینده من" subtitle="رزروهای فعال" icon={CalendarCheck2} />
            {myUpcoming.length ? (
              <div className="space-y-2">
                {myUpcoming.slice(0, 4).map((appointment) => {
                  const doc = getDoctor(appointment.doctorId);
                  return (
                    <div key={appointment.id} className="flex items-center gap-2 rounded-lg border border-base-300/60 p-2">
                      <Avatar name={doc?.name ?? ''} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold text-base-content">{doc?.name}</p>
                        <p className="text-[9px] text-base-content/45">
                          {faShortDate(appointment.date)} · {faDigits(appointment.time)}
                        </p>
                      </div>
                      <Badge tone={appointment.paid ? 'success' : 'warning'}>
                        {appointment.paid ? 'پرداخت‌شده' : 'در انتظار پرداخت'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={CalendarPlus} title="نوبتی ندارید" description="با انتخاب پزشک و زمان، اولین نوبت خود را رزرو کنید." />
            )}
            {invoices.some((i) => i.patientId === patientId && i.status !== 'تسویه‌شده') ? (
              <button
                type="button"
                onClick={() => setPage('payments')}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-warning/10 py-1.5 text-[10px] font-medium text-warning"
              >
                فاکتور پرداخت‌نشده دارید <ChevronLeft className="size-3" />
              </button>
            ) : null}
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(checkout)}
        onClose={() => setCheckout(null)}
        title={checkout?.paid ? 'نوبت شما قطعی شد' : 'پرداخت هزینه ویزیت'}
        description={checkout?.paid ? 'جزئیات نوبت و رسید پرداخت' : 'درگاه پرداخت امن کلینیک'}
        footer={
          checkout ? (
            checkout.paid ? (
              <button type="button" onClick={() => setCheckout(null)} className="btn btn-sm btn-primary rounded-xl text-xs">
                بازگشت به نوبت‌دهی
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setCheckout(null)} className="btn btn-sm rounded-xl border-base-300 bg-base-100 text-xs">
                  پرداخت بعداً
                </button>
                <button type="button" onClick={pay} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                  <CreditCard className="size-3.5" /> پرداخت {money(checkout.invoice.patientShare)}
                </button>
              </>
            )
          ) : null
        }
      >
        {checkout ? (
          <div className="space-y-3">
            {checkout.paid ? (
              <div className="rounded-xl bg-success/10 p-4 text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-success/20 text-success">
                  <Check className="size-6" />
                </span>
                <p className="mt-2 text-xs font-bold text-base-content">پرداخت با موفقیت انجام شد</p>
                <p className="mt-1 text-[10px] text-base-content/50">کد پیگیری: TRX-{faDigits(88000 + checkout.appointment.queueNo)}</p>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['بیمار', patient?.name ?? '—'],
                ['پزشک', getDoctor(checkout.appointment.doctorId)?.name ?? '—'],
                ['تاریخ', faShortDate(checkout.appointment.date)],
                ['ساعت', faDigits(checkout.appointment.time)],
                ['اتاق', checkout.appointment.room],
                ['شماره صف', faDigits(checkout.appointment.queueNo)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-base-300/60 px-2.5 py-1.5">
                  <p className="text-[9px] text-base-content/40">{label}</p>
                  <p className="mt-0.5 font-medium text-base-content">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-base-200/60 px-3 py-2">
              <span className="text-[11px] text-base-content/55">مبلغ قابل پرداخت</span>
              <span className="text-sm font-extrabold text-primary">{money(checkout.invoice.patientShare)}</span>
            </div>
            {!checkout.paid ? (
              <p className="flex items-center gap-1.5 rounded-lg bg-info/5 px-3 py-2 text-[10px] text-info">
                <ShieldCheck className="size-3.5" /> پرداخت از طریق درگاه امن شتاب — اطلاعات کارت شما ذخیره نمی‌شود.
              </p>
            ) : (
              <p className="text-[10px] leading-5 text-base-content/45">
                رسید پرداخت در بخش «پرداخت‌ها و فاکتورها» قابل مشاهده و چاپ است.
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
