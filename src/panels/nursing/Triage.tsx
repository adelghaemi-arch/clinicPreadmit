import { useMemo, useState, type FormEvent } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Save,
  Thermometer,
  UserRound,
  Weight,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Field, inputClass } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { getDoctor, getPatient } from '../../data/mock';
import { bmiOf, faDigits, faShortDate, num, toEnDigits, todayIso } from '../../lib/utils';
import { AppointmentStatusBadge, QueueBadge } from '../../components/clinic/ClinicBits';

interface VitalForm {
  bloodPressure: string;
  pulse: string;
  temperature: string;
  spo2: string;
  glucose: string;
  weight: string;
  height: string;
  note: string;
}

const emptyForm: VitalForm = {
  bloodPressure: '',
  pulse: '',
  temperature: '',
  spo2: '',
  glucose: '',
  weight: '',
  height: '',
  note: '',
};

export function NursingTriage() {
  const { user, appointments, vitals, saveVitals, updateAppointment, notify } = useApp();
  const today = todayIso();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<VitalForm>(emptyForm);

  const todayList = useMemo(
    () =>
      appointments
        .filter((a) => a.date === today && a.status !== 'canceled' && a.status !== 'scheduled')
        .sort((a, b) => a.queueNo - b.queueNo),
    [appointments, today],
  );
  const pending = todayList.filter((a) => !vitals.some((v) => v.appointmentId === a.id));
  const selected = todayList.find((a) => a.id === selectedId) ?? pending[0] ?? todayList[0];
  const patient = getPatient(selected?.patientId);
  const doctor = getDoctor(selected?.doctorId);
  const recorded = vitals.filter((v) => v.appointmentId === selected?.id)[0];

  const bmi =
    Number(toEnDigits(form.height)) > 0 && Number(toEnDigits(form.weight)) > 0
      ? bmiOf(Number(toEnDigits(form.height)), Number(toEnDigits(form.weight)))
      : 0;

  const set = (key: keyof VitalForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !patient) return;
    const values = {
      pulse: Number(toEnDigits(form.pulse)),
      temperature: Number(toEnDigits(form.temperature)),
      spo2: Number(toEnDigits(form.spo2)),
      glucose: Number(toEnDigits(form.glucose)),
      weight: Number(toEnDigits(form.weight)),
      height: Number(toEnDigits(form.height)),
    };
    if (!/^\d{2,3}\/\d{2,3}$/.test(toEnDigits(form.bloodPressure))) {
      notify('warning', 'فشار خون نامعتبر', 'فشار خون را به شکل ۱۲۰/۸۰ وارد کنید.');
      return;
    }
    if (
      Object.values(values).some((v) => Number.isNaN(v) || v <= 0) ||
      values.spo2 > 100 ||
      values.temperature > 45
    ) {
      notify('warning', 'مقادیر علائم حیاتی را کامل کنید', 'نبض، دما، اکسیژن، قند، وزن و قد باید معتبر باشند.');
      return;
    }
    saveVitals({
      patientId: patient.id,
      appointmentId: selected.id,
      bloodPressure: faDigits(toEnDigits(form.bloodPressure)),
      pulse: values.pulse,
      temperature: values.temperature,
      spo2: values.spo2,
      glucose: values.glucose,
      weight: values.weight,
      height: values.height,
      note: form.note,
      recordedBy: user?.name ?? 'پرستار',
    });
    if (selected.status === 'arrived') {
      updateAppointment(selected.id, { status: 'waiting' });
    }
    notify('success', 'علائم حیاتی ثبت شد', `${patient.name} آماده ویزیت پزشک است.`);
    setForm(emptyForm);
    setSelectedId(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="تریاژ و علائم حیاتی"
        description="ثبت فشار خون، نبض، دما، اکسیژن خون، قند و شاخص توده بدنی پیش از ورود بیمار به اتاق پزشک."
        badge={<Badge tone="warning" dot>{faDigits(pending.length)} بیمار در انتظار تریاژ</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="بیماران امروز" value={num(todayList.length)} icon={UserRound} tone="amber" hint="پذیرش‌شده در کلینیک" />
        <StatCard label="در انتظار تریاژ" value={num(pending.length)} icon={Activity} tone="rose" hint="نیازمند ثبت علائم" />
        <StatCard label="تریاژ تکمیل‌شده" value={num(todayList.length - pending.length)} icon={CheckCircle2} tone="emerald" hint="آماده ویزیت پزشک" />
        <StatCard label="میانگین زمان تریاژ" value="۶ دقیقه" icon={HeartPulse} tone="teal" hint="از پذیرش تا ثبت علائم" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="ثبت علائم حیاتی"
            subtitle={patient ? `${patient.name} — ${doctor?.name}` : 'بیماری انتخاب نشده است'}
            icon={Activity}
            action={selected ? <QueueBadge number={selected.queueNo} active /> : undefined}
          />

          {patient && selected ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-base-200/60 p-2.5">
                <Avatar name={patient.name} size="sm" />
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-base-content">{patient.name}</p>
                  <p className="text-[9px] text-base-content/45">
                    {faDigits(patient.age)} ساله · {patient.insurance} · پرونده {patient.fileNo}
                  </p>
                </div>
                <AppointmentStatusBadge status={selected.status} />
                {recorded ? <Badge tone="success">علائم قبلاً ثبت شده</Badge> : null}
              </div>

              {patient.allergies.length ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-error/5 px-2.5 py-1.5 text-[10px] text-error">
                  <AlertTriangle className="size-3.5" /> حساسیت: {patient.allergies.join('، ')}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="فشار خون (mmHg)" required>
                  <input
                    value={form.bloodPressure}
                    onChange={(e) => set('bloodPressure', e.target.value)}
                    placeholder="۱۲۰/۸۰"
                    className={`${inputClass} text-center`}
                    dir="ltr"
                  />
                </Field>
                <Field label="نبض (ضربه/دقیقه)" required>
                  <div className="relative">
                    <HeartPulse className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-rose-400" />
                    <input
                      value={form.pulse}
                      onChange={(e) => set('pulse', e.target.value)}
                      placeholder="78"
                      inputMode="numeric"
                      className={`${inputClass} pr-8 text-center`}
                      dir="ltr"
                    />
                  </div>
                </Field>
                <Field label="دمای بدن (°C)" required>
                  <div className="relative">
                    <Thermometer className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-amber-400" />
                    <input
                      value={form.temperature}
                      onChange={(e) => set('temperature', e.target.value)}
                      placeholder="36.8"
                      inputMode="decimal"
                      className={`${inputClass} pr-8 text-center`}
                      dir="ltr"
                    />
                  </div>
                </Field>
                <Field label="اشباع اکسیژن (٪)" required>
                  <div className="relative">
                    <Droplets className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-sky-400" />
                    <input
                      value={form.spo2}
                      onChange={(e) => set('spo2', e.target.value)}
                      placeholder="98"
                      inputMode="numeric"
                      className={`${inputClass} pr-8 text-center`}
                      dir="ltr"
                    />
                  </div>
                </Field>
                <Field label="قند خون (mg/dL)" required>
                  <input
                    value={form.glucose}
                    onChange={(e) => set('glucose', e.target.value)}
                    placeholder="104"
                    inputMode="numeric"
                    className={`${inputClass} text-center`}
                    dir="ltr"
                  />
                </Field>
                <Field label="وزن (kg)" required>
                  <div className="relative">
                    <Weight className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-purple-400" />
                    <input
                      value={form.weight}
                      onChange={(e) => set('weight', e.target.value)}
                      placeholder="68"
                      inputMode="decimal"
                      className={`${inputClass} pr-8 text-center`}
                      dir="ltr"
                    />
                  </div>
                </Field>
                <Field label="قد (cm)" required>
                  <input
                    value={form.height}
                    onChange={(e) => set('height', e.target.value)}
                    placeholder="163"
                    inputMode="numeric"
                    className={`${inputClass} text-center`}
                    dir="ltr"
                  />
                </Field>
                <Field label="شاخص توده بدنی (BMI)">
                  <div className="flex h-[42px] items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-200/50 text-sm font-extrabold text-primary">
                    {bmi ? faDigits(bmi) : '—'}
                  </div>
                </Field>
              </div>

              <Field label="یادداشت پرستار">
                <textarea
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  rows={2}
                  placeholder="مثال: تاکی‌کاردی خفیف — اطلاع به پزشک..."
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {bmi >= 30 || (form.temperature && Number(toEnDigits(form.temperature)) >= 38) ? (
                <p className="rounded-lg bg-warning/10 px-3 py-2 text-[10px] text-warning">
                  ⚠ هشدار: {bmi >= 30 ? 'شاخص توده بدنی بالا' : 'تب بیمار بالای ۳۸ درجه'} — پزشک معالج مطلع شود.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-300/60 pt-3">
                <span className="text-[10px] text-base-content/40">پس از ثبت، بیمار در صف ویزیت پزشک قرار می‌گیرد.</span>
                <button type="submit" className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                  <Save className="size-3.5" /> ثبت علائم حیاتی
                </button>
              </div>
            </form>
          ) : (
            <EmptyState icon={Activity} title="بیماری در انتظار تریاژ نیست" description="با پذیرش بیمار جدید در بخش پذیرش، لیست به‌روزرسانی می‌شود." />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="صف تریاژ امروز" subtitle="بیماران پذیرش‌شده" icon={UserRound} />
            {todayList.length ? (
              <div className="max-h-[420px] space-y-1.5 overflow-y-auto">
                {todayList.map((appointment) => {
                  const p = getPatient(appointment.patientId);
                  const done = vitals.some((v) => v.appointmentId === appointment.id);
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(appointment.id);
                        setForm(emptyForm);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl border p-2 text-right transition ${
                        selected?.id === appointment.id
                          ? 'border-primary bg-primary/5'
                          : 'border-base-300/60 hover:bg-base-200/40'
                      }`}
                    >
                      <QueueBadge number={appointment.queueNo} active={selected?.id === appointment.id} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-base-content">{p?.name}</p>
                        <p className="text-[9px] text-base-content/40">{getDoctor(appointment.doctorId)?.specialty}</p>
                      </div>
                      {done ? <Badge tone="success">ثبت شد</Badge> : <Badge tone="warning">در انتظار</Badge>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-center text-[10px] text-base-content/40">
                {faShortDate(today)} — بیماری پذیرش نشده است.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader title="آخرین علائم ثبت‌شده" subtitle="امروز" icon={CheckCircle2} />
            <div className="space-y-1.5">
              {vitals.slice(0, 4).map((v) => (
                <div key={v.id} className="flex items-center gap-2 rounded-lg bg-base-200/40 px-2 py-1.5 text-[10px]">
                  <Avatar name={getPatient(v.patientId)?.name ?? ''} size="xs" />
                  <span className="flex-1 truncate font-medium text-base-content/70">{getPatient(v.patientId)?.name}</span>
                  <span className="text-base-content/45">فشار {v.bloodPressure}</span>
                  <span className="text-base-content/30">{v.recordedAt}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
