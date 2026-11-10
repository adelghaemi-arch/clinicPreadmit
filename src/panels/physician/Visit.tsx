import { useMemo, useState, type FormEvent } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  NotebookPen,
  Pill,
  Save,
  Send,
  Stethoscope,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { useApp } from '../../store/AppStore';
import { diagnosisCatalog, getDoctor, getPatient } from '../../data/mock';
import { faDigits, faShortDate, todayIso } from '../../lib/utils';

export function VisitPage() {
  const {
    user,
    patients,
    appointments,
    vitals,
    visits,
    addVisit,
    addReferral,
    updateAppointment,
    setPage,
    notify,
  } = useApp();
  const doctorId = user?.doctorId ?? 'd1';
  const today = todayIso();

  const myToday = appointments.filter((a) => a.doctorId === doctorId && a.date === today);
  const initial = useMemo(() => {
    const active = myToday.find((a) => ['in-progress', 'waiting', 'arrived'].includes(a.status));
    return active?.patientId ?? myToday[0]?.patientId ?? patients[0]?.id ?? 'p1';
  }, [appointments, doctorId, patients, today]);

  const [patientId, setPatientId] = useState(initial);
  const [complaint, setComplaint] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState(diagnosisCatalog[0]?.code ?? '');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('۲ هفته بعد');
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referralTo, setReferralTo] = useState('بخش قلب — اکوکاردیوگرافی');
  const [referralReason, setReferralReason] = useState('');
  const [referralPriority, setReferralPriority] = useState<'عادی' | 'فوری'>('عادی');
  const [saved, setSaved] = useState(false);

  const patient = getPatient(patientId);
  const doctor = getDoctor(doctorId);
  const patientVisits = visits.filter((v) => v.patientId === patientId);
  const latestVital = vitals.find((v) => v.patientId === patientId);
  const diagnosis = diagnosisCatalog.find((d) => d.code === diagnosisCode);
  const appointment = myToday.find((a) => a.patientId === patientId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) {
      notify('warning', 'شرح حال الزامی است', 'علت مراجعه و شکایت اصلی بیمار را وارد کنید.');
      return;
    }
    if (!diagnosis) return;
    addVisit({
      patientId,
      doctorId,
      date: today,
      chiefComplaint: complaint,
      diagnosis: diagnosis.title.split('(')[0]?.trim() ?? diagnosis.title,
      icd: diagnosis.code,
      notes,
      followUp,
    });
    if (appointment && appointment.status !== 'done') {
      updateAppointment(appointment.id, { status: 'done' });
    }
    if (referralEnabled && referralReason.trim()) {
      addReferral({
        patientId,
        fromDoctor: doctor?.name ?? 'پزشک معالج',
        to: referralTo,
        reason: referralReason,
        priority: referralPriority,
      });
    }
    notify('success', 'ویزیت با موفقیت ثبت شد', `${patient?.name} — تشخیص ${diagnosis.title.split('(')[0]}`);
    setSaved(true);
    setComplaint('');
    setNotes('');
    setReferralEnabled(false);
    setReferralReason('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="ثبت ویزیت و شرح حال"
        description="ثبت علائم بالینی، تشخیص بر اساس ICD-10، دستورات پزشکی و ارجاع درون‌بیمارستانی."
        badge={<Badge tone="primary" dot>اتاق {doctor?.room.replace('اتاق ', '')}</Badge>}
        actions={
          <select
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setSaved(false);
            }}
            className="input input-sm h-9 w-56 rounded-xl border-base-300 bg-base-100 text-xs clinic-select"
          >
            {myToday.map((a) => (
              <option key={a.id} value={a.patientId}>
                نوبت {a.queueNo} — {getPatient(a.patientId)?.name}
              </option>
            ))}
            {myToday.length === 0
              ? patients.slice(0, 5).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              : null}
          </select>
        }
      />

      {saved ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-3 animate-fade-up">
          <span className="grid size-9 place-items-center rounded-xl bg-success/15 text-success">
            <CheckCircle2 className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-base-content">ویزیت ثبت و در پرونده الکترونیک ذخیره شد.</p>
            <p className="mt-0.5 text-[10px] text-base-content/50">می‌توانید برای همین بیمار نسخه الکترونیک صادر کنید.</p>
          </div>
          <button type="button" onClick={() => setPage('prescription')} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-[11px]">
            <Pill className="size-3.5" /> صدور نسخه
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="فرم ویزیت"
            subtitle="اطلاعات بالینی جاری بیمار"
            icon={NotebookPen}
            action={<span className="text-[10px] text-base-content/40">{faShortDate(today)}</span>}
          />
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-base-200/60 p-3">
              <Avatar name={patient?.name ?? ''} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-base-content">{patient?.name}</p>
                <p className="mt-0.5 text-[10px] text-base-content/50">
                  {faDigits(patient?.age ?? 0)} ساله · {patient?.gender} · {patient?.insurance}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-base-content/40">نوبت امروز</p>
                <p className="text-[11px] font-bold text-base-content">
                  {appointment ? `${faDigits(appointment.time)} — شماره ${faDigits(appointment.queueNo)}` : 'بدون نوبت'}
                </p>
              </div>
            </div>

            {patient?.allergies.length ? (
              <div className="flex items-center gap-2 rounded-lg bg-error/5 px-3 py-2 text-[11px] text-error">
                <AlertTriangle className="size-4 shrink-0" />
                حساسیت دارویی: {patient.allergies.join('، ')}
              </div>
            ) : null}

            <Field label="شرح حال و شکایت اصلی بیمار" required>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={3}
                placeholder="مثال: درد قفسه سینه از دو روز پیش، تشدید با فعالیت، بدون انتشار به دست چپ..."
                className={`${inputClass} resize-none leading-6`}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="تشخیص نهایی (ICD-10)" required>
                <select value={diagnosisCode} onChange={(e) => setDiagnosisCode(e.target.value)} className={selectClass}>
                  {diagnosisCatalog.map((d) => (
                    <option key={d.code} value={d.code}>{d.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="کد تشخیص">
                <input value={diagnosis?.code ?? ''} readOnly className={`${inputClass} font-mono`} dir="ltr" />
              </Field>
            </div>

            <Field label="دستورات و توضیحات پزشک">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="اقدامات انجام‌شده، داروهای تجویزشده و توصیه‌های غیردارویی..."
                className={`${inputClass} resize-none leading-6`}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="زمان پیگیری">
                <select value={followUp} onChange={(e) => setFollowUp(e.target.value)} className={selectClass}>
                  {['۱ هفته بعد', '۲ هفته بعد', '۱ ماه بعد', '۳ ماه بعد', 'در صورت تشدید علائم', 'نیازی به پیگیری نیست'].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field label="ارجاع درون‌بیمارستانی">
                <label className="flex h-[42px] cursor-pointer items-center justify-between rounded-xl border border-base-300 bg-base-100 px-3">
                  <span className="text-[11px] text-base-content/60">صدور برگه ارجاع</span>
                  <input
                    type="checkbox"
                    checked={referralEnabled}
                    onChange={(e) => setReferralEnabled(e.target.checked)}
                    className="toggle toggle-primary toggle-sm"
                  />
                </label>
              </Field>
            </div>

            {referralEnabled ? (
              <div className="space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 animate-fade-in">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="ارجاع به بخش">
                    <select value={referralTo} onChange={(e) => setReferralTo(e.target.value)} className={selectClass}>
                      {[
                        'بخش قلب — اکوکاردیوگرافی',
                        'بخش قلب — آنژیوگرافی',
                        'بخش رادیولوژی',
                        'آزمایشگاه مرکزی',
                        'فیزیوتراپی بیمارستان',
                        'اورژانس اصلی بیمارستان',
                        'بخش داخلی — بستری',
                      ].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="اولویت ارجاع">
                    <select
                      value={referralPriority}
                      onChange={(e) => setReferralPriority(e.target.value as 'عادی' | 'فوری')}
                      className={selectClass}
                    >
                      <option value="عادی">عادی</option>
                      <option value="فوری">فوری</option>
                    </select>
                  </Field>
                </div>
                <Field label="دلیل ارجاع" required>
                  <input value={referralReason} onChange={(e) => setReferralReason(e.target.value)} className={inputClass} placeholder="توضیح دلیل ارجاع..." />
                </Field>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-300/60 pt-3">
              <span className="text-[10px] text-base-content/40">ثبت ویزیت، وضعیت نوبت بیمار را به «ویزیت‌شده» تغییر می‌دهد.</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage('ehr')} className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs">
                  <FileText className="size-3.5" /> پرونده بیمار
                </button>
                <button type="submit" className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                  <Save className="size-3.5" /> ثبت نهایی ویزیت
                </button>
              </div>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="خلاصه وضعیت بیمار" subtitle="آخرین علائم حیاتی ثبت‌شده" icon={Activity} />
            {latestVital ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'فشار خون', value: latestVital.bloodPressure, icon: HeartPulse, tone: 'text-rose-500' },
                    { label: 'نبض', value: `${faDigits(latestVital.pulse)}`, icon: Activity, tone: 'text-indigo-500' },
                    { label: 'دمای بدن', value: `${faDigits(latestVital.temperature)}°`, icon: Activity, tone: 'text-amber-500' },
                    { label: 'SPO₂', value: `${faDigits(latestVital.spo2)}٪`, icon: Activity, tone: 'text-sky-500' },
                    { label: 'قند خون', value: `${faDigits(latestVital.glucose)}`, icon: Activity, tone: 'text-emerald-500' },
                    { label: 'BMI', value: `${faDigits(latestVital.bmi)}`, icon: Activity, tone: 'text-purple-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-lg border border-base-300/60 p-2">
                        <Icon className={`size-3.5 ${item.tone}`} />
                        <p className="mt-1 text-[11px] font-bold text-base-content">{item.value}</p>
                        <p className="text-[9px] text-base-content/40">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[9px] text-base-content/40">
                  ثبت‌شده توسط {latestVital.recordedBy} — ساعت {latestVital.recordedAt}
                </p>
              </>
            ) : (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-[10px] leading-5 text-warning">
                علائم حیاتی این بیمار ثبت نشده است؛ پیش از ویزیت به پرستاری اطلاع دهید.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader title="سوابق ویزیت" subtitle="آخرین مراجعات این بیمار" icon={ClipboardList} />
            {patientVisits.length ? (
              <div className="space-y-2">
                {patientVisits.slice(0, 3).map((visit) => (
                  <div key={visit.id} className="rounded-lg border border-base-300/60 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-base-content/75">{visit.diagnosis}</p>
                      <span className="text-[9px] text-base-content/35">{faShortDate(visit.date)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-base-content/45">{visit.chiefComplaint}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-base-content/40">سابقه‌ای ثبت نشده است.</p>
            )}
            <button
              type="button"
              onClick={() => setPage('ehr')}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-base-300 py-1.5 text-[10px] text-base-content/55 hover:bg-base-200"
            >
              مشاهده پرونده کامل
            </button>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-start gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Stethoscope className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-base-content">یادآوری بالینی</p>
                <p className="mt-1 text-[10px] leading-5 text-base-content/55">
                  برای بیماران با سابقه فشار خون، اندازه‌گیری در دو نوبت و میانگین‌گیری توصیه می‌شود.
                  در صورت نیاز به بستری، از بخش ارجاع استفاده کنید.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="اقدامات سریع" icon={Send} />
            <div className="grid gap-2">
              <button type="button" onClick={() => setPage('prescription')} className="flex items-center justify-between rounded-lg bg-base-200/60 px-3 py-2 text-[11px] hover:bg-base-200">
                <span className="flex items-center gap-1.5"><Pill className="size-3.5 text-primary" /> نسخه‌نویسی الکترونیک</span>
                <span className="text-base-content/30">›</span>
              </button>
              <button type="button" onClick={() => notify('info', 'درخواست پاراکلینیک', 'برای ثبت آزمایش، از بخش نسخه الکترونیک استفاده کنید.')} className="flex items-center justify-between rounded-lg bg-base-200/60 px-3 py-2 text-[11px] hover:bg-base-200">
                <span className="flex items-center gap-1.5"><CalendarClock className="size-3.5 text-secondary" /> درخواست آزمایش و تصویربرداری</span>
                <span className="text-base-content/30">›</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
