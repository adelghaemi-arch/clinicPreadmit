import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BellRing,
  CalendarClock,
  CheckCircle2,
  FileText,
  Hourglass,
  Megaphone,
  Radio,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { getDoctor, getPatient } from '../../data/mock';
import { faDigits, faFullDate, money, num, sum, todayIso } from '../../lib/utils';
import { AppointmentStatusBadge, LiveTag, QueueBadge } from '../../components/clinic/ClinicBits';
import { StatusDot } from '../../components/ui/Badge';

export function PhysicianAppointments() {
  const { user, appointments, invoices, vitals, callNextPatient, updateAppointment, setPage, notify } = useApp();
  const [filter, setFilter] = useState('all');
  const doctorId = user?.doctorId ?? 'd1';
  const doctor = getDoctor(doctorId);
  const today = todayIso();

  const list = useMemo(
    () =>
      appointments
        .filter((a) => a.doctorId === doctorId && a.date === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, doctorId, today],
  );

  const current = list.find((a) => a.status === 'in-progress');
  const waitingCount = list.filter((a) => ['waiting', 'arrived'].includes(a.status)).length;
  const doneCount = list.filter((a) => a.status === 'done').length;
  const income = sum(
    invoices.filter((i) => i.doctorId === doctorId && i.date === today).map((i) => i.paidAmount),
  );
  const currentPatient = getPatient(current?.patientId);

  const filtered = list.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'waiting') return ['arrived', 'waiting'].includes(a.status);
    if (filter === 'done') return a.status === 'done';
    if (filter === 'scheduled') return a.status === 'scheduled';
    return true;
  });

  const callNext = () => {
    const next = callNextPatient(doctorId);
    if (!next) {
      notify('warning', 'بیماری در صف انتظار نیست', 'همه نوبت‌های امروز ویزیت شده‌اند.');
      return;
    }
    notify('success', 'بیمار بعدی فراخوانده شد', `نوبت ${faDigits(next.queueNo)} — ${getPatient(next.patientId)?.name}`);
  };

  const finishCurrent = () => {
    if (!current) return;
    updateAppointment(current.id, { status: 'done' });
    notify('success', 'ویزیت ثبت شد', `${currentPatient?.name} از اتاق معاینه خارج شد.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="نوبت‌های امروز"
        description={`${faFullDate(today)} — ${doctor?.room} · ${doctor?.specialty}`}
        badge={<LiveTag label="اتاق ویزیت آنلاین" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => setPage('ehr')}
              className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
            >
              <FileText className="size-3.5" /> پرونده بیمار
            </button>
            <button onClick={callNext} type="button" className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
              <Megaphone className="size-3.5" /> فراخوان بیمار بعدی
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="کل نوبت‌های امروز" value={num(list.length)} icon={CalendarClock} tone="rose" hint={`${faDigits(doneCount)} ویزیت تکمیل‌شده`} />
        <StatCard label="در انتظار ویزیت" value={num(waitingCount)} icon={Hourglass} tone="amber" hint="شامل بیماران تریاژشده" />
        <StatCard label="ویزیت‌های انجام‌شده" value={num(doneCount)} icon={CheckCircle2} tone="emerald" hint="ثبت‌شده در پرونده الکترونیک" />
        <StatCard label="درآمد وصول‌شده" value={money(income)} icon={Stethoscope} tone="teal" hint="سهم کلینیک از ویزیت‌های امروز" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <CardHeader
              className="mb-0"
              title="لیست نوبت‌های امروز"
              subtitle="ترتیب بر اساس زمان و شماره صف"
              icon={Users}
            />
            <Tabs
              items={[
                { id: 'all', label: 'همه' },
                { id: 'waiting', label: 'در انتظار', count: waitingCount },
                { id: 'done', label: 'ویزیت‌شده', count: doneCount },
                { id: 'scheduled', label: 'نوبت‌گرفته' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <div className="overflow-x-auto px-2 pb-2">
            <table className="table table-sm">
              <thead>
                <tr className="text-[10px] text-base-content/45">
                  <th className="font-medium">صف</th>
                  <th className="font-medium">بیمار</th>
                  <th className="font-medium">ساعت</th>
                  <th className="font-medium">نوع ویزیت</th>
                  <th className="font-medium">علائم حیاتی</th>
                  <th className="font-medium">وضعیت</th>
                  <th className="font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appointment) => {
                  const patient = getPatient(appointment.patientId);
                  const hasVitals = vitals.some((v) => v.appointmentId === appointment.id);
                  const active = appointment.status === 'in-progress';
                  return (
                    <tr
                      key={appointment.id}
                      className={`border-base-300/50 transition hover:bg-base-200/40 ${active ? 'bg-primary/5' : ''}`}
                    >
                      <td><QueueBadge number={appointment.queueNo} active={active} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={patient?.name ?? ''} size="xs" />
                          <div>
                            <p className="text-xs font-semibold text-base-content">{patient?.name}</p>
                            <p className="text-[10px] text-base-content/40">
                              {faDigits(patient?.age ?? 0)} ساله · {patient?.insurance}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-[11px] font-medium tabular-nums" dir="ltr">{faDigits(appointment.time)}</td>
                      <td>
                        <span className="text-[10px] text-base-content/60">{appointment.type}</span>
                        <p className="text-[9px] text-base-content/35">{appointment.source}</p>
                      </td>
                      <td>
                        {hasVitals ? (
                          <Badge tone="success">ثبت شده</Badge>
                        ) : (
                          <Badge tone="warning">ثبت نشده</Badge>
                        )}
                      </td>
                      <td><AppointmentStatusBadge status={appointment.status} /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          {['arrived', 'waiting'].includes(appointment.status) ? (
                            <button
                              type="button"
                              onClick={() => {
                                updateAppointment(appointment.id, { status: 'in-progress' });
                                notify('info', 'بیمار به اتاق فراخوانده شد', patient?.name);
                              }}
                              className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20"
                            >
                              فراخوان
                            </button>
                          ) : null}
                          {active ? (
                            <button
                              type="button"
                              onClick={finishCurrent}
                              className="rounded-lg bg-success/10 px-2 py-1 text-[10px] font-medium text-success hover:bg-success/20"
                            >
                              پایان ویزیت
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setPage('ehr')}
                            className="rounded-lg border border-base-300 px-2 py-1 text-[10px] text-base-content/60 hover:bg-base-200"
                          >
                            پرونده
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={CalendarClock} title="نوبتی در این وضعیت وجود ندارد" description="فیلتر دیگری را انتخاب کنید یا بیمار بعدی را فراخوان کنید." />
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -left-6 -top-10 size-24 rounded-full bg-primary/10 blur-2xl" />
            <CardHeader
              title="اتاق ویزیت"
              subtitle={doctor?.room}
              icon={Radio}
              action={<StatusDot tone={current ? 'primary' : 'success'} pulse />}
            />
            {current && currentPatient ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3">
                  <Avatar name={currentPatient.name} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-base-content">{currentPatient.name}</p>
                    <p className="text-[11px] text-base-content/50">
                      {faDigits(currentPatient.age)} ساله · {currentPatient.insurance}
                    </p>
                    <div className="mt-1 flex gap-1">
                      <Badge tone="primary">نوبت {faDigits(current.queueNo)}</Badge>
                      <Badge tone="neutral">{current.type}</Badge>
                    </div>
                  </div>
                </div>
                {currentPatient.allergies.length > 0 ? (
                  <p className="mt-3 rounded-lg bg-error/5 px-2.5 py-1.5 text-[10px] text-error">
                    ⚠ حساسیت: {currentPatient.allergies.join('، ')}
                  </p>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPage('visit')}
                    className="btn btn-sm btn-primary gap-1 rounded-lg text-[11px]"
                  >
                    <Activity className="size-3.5" /> ثبت ویزیت
                  </button>
                  <button
                    type="button"
                    onClick={finishCurrent}
                    className="btn btn-sm gap-1 rounded-lg border-base-300 bg-base-100 text-[11px]"
                  >
                    <CheckCircle2 className="size-3.5" /> پایان
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-base-300 px-3 py-6 text-center">
                <BellRing className="mx-auto size-6 text-base-content/30" />
                <p className="mt-2 text-[11px] font-medium text-base-content/60">اتاق آماده پذیرش بیمار</p>
                <p className="mt-0.5 text-[10px] text-base-content/40">
                  {waitingCount > 0 ? `${faDigits(waitingCount)} بیمار در انتظار فراخوان` : 'بیمار منتظری وجود ندارد'}
                </p>
                <button type="button" onClick={callNext} className="btn btn-primary btn-sm mt-3 w-full rounded-xl text-[11px]">
                  فراخوان بیمار بعدی
                </button>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="برنامه روز" subtitle="ساعات حضور در کلینیک" icon={CalendarClock} />
            <div className="space-y-2">
              {[
                { time: '۰۸:۰۰', label: 'شروع شیفت و بازدید پرستاری', done: true },
                { time: '۰۹:۰۰', label: 'ویزیت‌های صبح', done: true },
                { time: '۱۳:۰۰', label: 'استراحت و ناهار', done: false },
                { time: '۱۴:۰۰', label: 'ویزیت‌های عصر', done: false },
                { time: '۱۹:۰۰', label: 'پایان شیفت', done: false },
              ].map((item) => (
                <div key={item.time} className="flex items-center gap-2 text-[11px]">
                  <span className="w-12 shrink-0 tabular-nums text-base-content/40" dir="ltr">{item.time}</span>
                  <span className={`size-1.5 rounded-full ${item.done ? 'bg-success' : 'bg-base-300'}`} />
                  <span className={item.done ? 'text-base-content/45 line-through' : 'text-base-content/65'}>{item.label}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage('prescription')}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-base-300 py-1.5 text-[11px] font-medium text-base-content/60 hover:bg-base-200"
            >
              نسخه‌نویسی الکترونیک <ArrowLeft className="size-3" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
