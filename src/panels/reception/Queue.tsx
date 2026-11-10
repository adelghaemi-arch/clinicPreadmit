import { useMemo, useState } from 'react';
import {
  Activity,
  BellRing,
  CheckCircle2,
  Clock3,
  Hourglass,
  ListOrdered,
  Megaphone,
  MonitorPlay,
  Radio,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { doctors, getDoctor, getPatient } from '../../data/mock';
import { faDigits, faShortDate, num, todayIso } from '../../lib/utils';
import { AppointmentStatusBadge, QueueBadge } from '../../components/clinic/ClinicBits';
import { StatusDot } from '../../components/ui/Badge';

export function ReceptionQueue() {
  const { appointments, vitals, callNextPatient, updateAppointment, notify } = useApp();
  const [doctorFilter, setDoctorFilter] = useState('all');
  const today = todayIso();

  const todayList = useMemo(
    () => appointments.filter((a) => a.date === today),
    [appointments, today],
  );

  const waiting = todayList
    .filter((a) => ['arrived', 'waiting'].includes(a.status))
    .filter((a) => doctorFilter === 'all' || a.doctorId === doctorFilter)
    .sort((a, b) => a.queueNo - b.queueNo);

  const inProgress = todayList.filter(
    (a) => a.status === 'in-progress' && (doctorFilter === 'all' || a.doctorId === doctorFilter),
  );

  const current = inProgress[0];
  const currentPatient = getPatient(current?.patientId);
  const currentDoctor = getDoctor(current?.doctorId);
  const nextThree = todayList
    .filter((a) => ['arrived', 'waiting'].includes(a.status))
    .sort((a, b) => a.queueNo - b.queueNo)
    .slice(0, 4);

  const call = (id: string) => {
    const appointment = appointments.find((a) => a.id === id);
    updateAppointment(id, { status: 'in-progress' });
    notify('success', 'بیمار فراخوانده شد', `نوبت ${faDigits(appointment?.queueNo ?? 0)} — ${getPatient(appointment?.patientId)?.name}`);
  };

  const callNext = () => {
    const targetDoctor =
      doctorFilter !== 'all'
        ? doctorFilter
        : doctors.find((d) =>
            todayList.some(
              (a) => a.doctorId === d.id && ['arrived', 'waiting'].includes(a.status),
            ),
          )?.id;
    if (!targetDoctor) {
      notify('warning', 'صف انتظار خالی است', 'بیماری برای فراخوان وجود ندارد.');
      return;
    }
    const next = callNextPatient(targetDoctor);
    if (!next) {
      notify('warning', 'صف این پزشک خالی است', getDoctor(targetDoctor)?.name);
      return;
    }
    notify(
      'success',
      'بیمار بعدی فراخوانده شد',
      `نوبت ${faDigits(next.queueNo)} — ${getPatient(next.patientId)?.name} — ${getDoctor(targetDoctor)?.room}`,
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="صف انتظار هوشمند"
        description="مدیریت نوبت‌های فعال، فراخوان بیمار به اتاق پزشک و نمایش شماره روی مانیتور سالن انتظار."
        badge={<Badge tone="success" dot>مانیتور متصل</Badge>}
        actions={
          <>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="input input-sm h-9 w-44 rounded-xl border-base-300 bg-base-100 text-xs clinic-select"
            >
              <option value="all">همه پزشکان</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button type="button" onClick={callNext} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
              <Megaphone className="size-3.5" /> فراخوان بعدی
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="در صف انتظار" value={num(waiting.length)} icon={Hourglass} tone="amber" hint="آماده فراخوان" />
        <StatCard label="در حال ویزیت" value={num(inProgress.length)} icon={Activity} tone="rose" hint="داخل اتاق پزشک" />
        <StatCard label="ویزیت‌شده امروز" value={num(todayList.filter((a) => a.status === 'done').length)} icon={CheckCircle2} tone="emerald" hint="تکمیل‌شده" />
        <StatCard label="میانگین انتظار" value={`${num(17)} دقیقه`} icon={Clock3} tone="sky" hint="از پذیرش تا فراخوان" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden bg-gradient-to-br from-neutral to-neutral/90 text-neutral-content xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 opacity-70" />
              <p className="text-xs font-semibold">نمایشگر سالن انتظار — کلینیک تخصصی مهر</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
              <StatusDot tone="success" pulse /> زنده
            </span>
          </div>

          {current && currentPatient ? (
            <div className="animate-fade-in">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 px-4 py-6 text-center backdrop-blur-sm sm:flex-row sm:justify-between sm:text-right">
                <div>
                  <p className="text-[11px] text-neutral-content/60">در حال ویزیت</p>
                  <p className="mt-1 text-6xl font-black tabular-nums sm:text-7xl">{faDigits(current.queueNo)}</p>
                  <p className="mt-1 text-sm font-bold">{currentPatient.name}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-content/60">
                    {currentDoctor?.name} · {current.room}
                  </p>
                </div>
                <div className="mt-4 flex flex-col items-center gap-2 sm:mt-0">
                  <span className="grid size-16 place-items-center rounded-full bg-primary/20">
                    <Radio className="size-7 animate-pulse-soft text-primary" />
                  </span>
                  <Badge tone="success" dot>اتاق در حال ویزیت</Badge>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[10px] text-neutral-content/50">نوبت‌های بعدی</p>
                <div className="grid grid-cols-4 gap-2">
                  {nextThree.map((a) => (
                    <div key={a.id} className="rounded-xl bg-white/5 py-2 text-center">
                      <p className="text-xl font-extrabold tabular-nums">{faDigits(a.queueNo)}</p>
                      <p className="truncate px-1 text-[9px] text-neutral-content/50">{getPatient(a.patientId)?.name.split(' ')[0]}</p>
                    </div>
                  ))}
                  {nextThree.length === 0 ? (
                    <p className="col-span-4 py-3 text-center text-[10px] text-neutral-content/40">صف انتظار خالی است</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 py-12 text-center">
              <BellRing className="size-8 text-neutral-content/40" />
              <p className="mt-2 text-sm font-bold">در حال حاضر بیماری در اتاق نیست</p>
              <p className=" mt-1 text-[11px] text-neutral-content/50">
                {waiting.length ? `${faDigits(waiting.length)} بیمار در انتظار فراخوان هستند` : 'صف انتظار خالی است'}
              </p>
              <button type="button" onClick={callNext} className="btn btn-primary btn-sm mt-4 rounded-xl text-xs">
                فراخوان بیمار بعدی
              </button>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="وضعیت پزشکان" subtitle="اتاق‌های در حال ویزیت" icon={Users} action={<Badge tone="neutral">{faDigits(doctors.length)} پزشک</Badge>} />
          <div className="max-h-[320px] space-y-1.5 overflow-y-auto">
            {doctors.map((doctor) => {
              const busy = todayList.find((a) => a.doctorId === doctor.id && a.status === 'in-progress');
              const doctorWaiting = todayList.filter(
                (a) => a.doctorId === doctor.id && ['arrived', 'waiting'].includes(a.status),
              ).length;
              return (
                <div key={doctor.id} className="flex items-center gap-2 rounded-lg border border-base-300/60 px-2 py-1.5">
                  <Avatar name={doctor.name} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-base-content">{doctor.name}</p>
                    <p className="truncate text-[9px] text-base-content/40">{doctor.room} · {doctor.specialty}</p>
                  </div>
                  {busy ? (
                    <Badge tone="primary" dot>{faDigits(busy.queueNo)}</Badge>
                  ) : doctorWaiting ? (
                    <Badge tone="warning">{faDigits(doctorWaiting)} در صف</Badge>
                  ) : (
                    <Badge tone="neutral">آزاد</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="لیست انتظار"
          subtitle="بیماران حاضر در سالن انتظار — به ترتیب شماره صف"
          icon={ListOrdered}
          action={<Badge tone="info">{faDigits(waiting.length)} بیمار</Badge>}
        />
        {waiting.length ? (
          <div className="space-y-2">
            {waiting.map((appointment) => {
              const patient = getPatient(appointment.patientId);
              const doctor = getDoctor(appointment.doctorId);
              const hasVitals = vitals.some((v) => v.appointmentId === appointment.id);
              return (
                <div key={appointment.id} className="flex flex-col gap-2 rounded-xl border border-base-300/60 p-2.5 transition hover:border-primary/30 hover:bg-base-200/30 sm:flex-row sm:items-center">
                  <QueueBadge number={appointment.queueNo} />
                  <div className="flex flex-1 items-center gap-2">
                    <Avatar name={patient?.name ?? ''} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-base-content">{patient?.name}</p>
                      <p className="text-[9px] text-base-content/45">
                        {doctor?.name} · {appointment.type} · {faShortDate(appointment.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={hasVitals ? 'success' : 'warning'}>
                      {hasVitals ? 'تریاژ شده' : 'بدون علائم حیاتی'}
                    </Badge>
                    <Badge tone="neutral">{faDigits(appointment.time)}</Badge>
                    <AppointmentStatusBadge status={appointment.status} />
                    <button
                      type="button"
                      onClick={() => call(appointment.id)}
                      className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-content hover:bg-primary/90"
                    >
                      صدا زدن
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateAppointment(appointment.id, { status: 'canceled' });
                        notify('info', 'نوبت از صف انتظار حذف شد', patient?.name);
                      }}
                      className="rounded-lg border border-base-300 px-2 py-1 text-[10px] text-base-content/50 hover:bg-error/10 hover:text-error"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={ListOrdered} title="صف انتظار خالی است" description="همه بیماران حاضر ویزیت شده‌اند یا هنوز پذیرش نشده‌اند." />
        )}
      </Card>
    </div>
  );
}
