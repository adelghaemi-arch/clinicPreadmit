import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Droplets,
  FileHeart,
  FileText,
  FlaskConical,
  FolderOpen,
  HeartPulse,
  Phone,
  Pill,
  ScanLine,
  Stethoscope,
  Thermometer,
  UserRound,
  Weight,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { doctors, getDoctor, patients } from '../../data/mock';
import { faDigits, faShortDate, todayIso } from '../../lib/utils';
import { InsuranceChip } from '../../components/clinic/ClinicBits';

const labPanel = [
  { test: 'CBC Diff', result: '۷٬۲۰۰', unit: '/µL', range: '۴٬۵۰۰ - ۱۱٬۰۰۰', status: 'طبیعی' },
  { test: 'Ferritin', result: '۲۸', unit: 'ng/mL', range: '۱۵ - ۱۵۰', status: 'طبیعی' },
  { test: 'TSH', result: '۲.۱', unit: 'mIU/L', range: '۰.۴ - ۴.۰', status: 'طبیعی' },
  { test: 'Vitamin D', result: '۱۸', unit: 'ng/mL', range: '۳۰ - ۱۰۰', status: 'کمبود' },
  { test: 'FBS', result: '۱۰۴', unit: 'mg/dL', range: '۷۰ - ۱۰۰', status: 'مرزی' },
  { test: 'Creatinine', result: '۰.۹', unit: 'mg/dL', range: '۰.۶ - ۱.۲', status: 'طبیعی' },
];

const imagingReports = [
  {
    id: 'img1',
    title: 'اکوکاردیوگرافی رنگی',
    date: todayIso(),
    doctor: 'دکتر سارا محمدی',
    result: 'ابعاد قلب نرمال، کسر تخلیه بطن چپ ۵۵٪، بدون نشت دریچه‌ای قابل توجه.',
    status: 'نتیجه آماده',
  },
  {
    id: 'img2',
    title: 'نوار قلب ۱۲ لید',
    date: todayIso(),
    doctor: 'دکتر سارا محمدی',
    result: 'ریتم سینوسی با ضربان ۷۸، بدون تغییرات ایسکمیک حاد.',
    status: 'نتیجه آماده',
  },
  {
    id: 'img3',
    title: 'رادیوگرافی قفسه سینه',
    date: todayIso(),
    doctor: 'دکتر رضا کریمی',
    result: 'در انتظار تفسیر متخصص رادیولوژی',
    status: 'در انتظار',
  },
];

export function EHRPage() {
  const { user, patients: patientList, visits, prescriptions, vitals, referrals, setPage } = useApp();
  const [tab, setTab] = useState('visits');
  const doctorId = user?.doctorId;
  const initialPatient = patients[0]?.id ?? 'p1';
  const [patientId, setPatientId] = useState(initialPatient);

  const patient = useMemo(
    () => patientList.find((p) => p.id === patientId) ?? patients[0]!,
    [patientList, patientId],
  );
  const myVisits = visits.filter((v) => v.patientId === patient.id);
  const myPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const myVitals = vitals.filter((v) => v.patientId === patient.id);
  const myReferrals = referrals.filter((r) => r.patientId === patient.id);
  const latestVital = myVitals[0];
  const requestedLabs = Array.from(new Set(myPrescriptions.flatMap((p) => p.labs)));
  const requestedImaging = Array.from(new Set(myPrescriptions.flatMap((p) => p.imaging)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="پرونده الکترونیک سلامت (EHR)"
        description="مشاهده سوابق بالینی، نتایج آزمایش و تصویربرداری، نسخ و علائم حیاتی بیمار."
        badge={<Badge tone="info" dot>دسترسی پزشک</Badge>}
        actions={
          <>
            <select
              value={patient.id}
              onChange={(e) => setPatientId(e.target.value)}
              className="input input-sm h-9 w-52 rounded-xl border-base-300 bg-base-100 text-xs clinic-select"
            >
              {patientList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — پرونده {p.fileNo}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setPage('visit')} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
              <Stethoscope className="size-3.5" /> ثبت ویزیت
            </button>
          </>
        }
      />

      <div className="relative overflow-hidden rounded-2xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Avatar name={patient.name} size="xl" ring />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-base-content">{patient.name}</h2>
                <Badge tone="success">پرونده فعال</Badge>
              </div>
              <p className="mt-1 text-[11px] text-base-content/55">
                {faDigits(patient.age)} ساله · {patient.gender} · گروه خونی {patient.blood}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-base-200/70 px-2 py-1 text-[10px] text-base-content/60">
                  <FolderOpen className="size-3" /> پرونده {patient.fileNo}
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-base-200/70 px-2 py-1 text-[10px] text-base-content/60">
                  <UserRound className="size-3" /> کد ملی {patient.nationalId}
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-base-200/70 px-2 py-1 text-[10px] text-base-content/60">
                  <Phone className="size-3" /> {faDigits(patient.phone)}
                </span>
                <InsuranceChip kind={patient.insurance} supplementary={patient.supplementary} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'ویزیت‌ها', value: myVisits.length },
              { label: 'نسخ', value: myPrescriptions.length },
              { label: 'علائم ثبت‌شده', value: myVitals.length },
              { label: 'ارجاعات', value: myReferrals.length },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-base-200/60 px-3 py-2 text-center">
                <p className="text-base font-extrabold text-base-content">{faDigits(item.value)}</p>
                <p className="text-[9px] text-base-content/45">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2 border-t border-base-300/60 pt-3">
          {patient.allergies.length > 0 ? (
            <span className="flex items-center gap-1 rounded-lg bg-error/10 px-2 py-1 text-[10px] font-medium text-error">
              <AlertTriangle className="size-3" /> حساسیت دارویی: {patient.allergies.join('، ')}
            </span>
          ) : (
            <span className="text-[10px] text-base-content/40">حساسیت دارویی ثبت نشده است.</span>
          )}
          <span className="flex items-center gap-1 rounded-lg bg-base-200/60 px-2 py-1 text-[10px] text-base-content/50">
            <HeartPulse className="size-3 text-rose-500" /> فشار خون آخر: {latestVital?.bloodPressure ?? '—'}
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-base-200/60 px-2 py-1 text-[10px] text-base-content/50">
            <Activity className="size-3 text-primary" /> نبض: {latestVital ? faDigits(latestVital.pulse) : '—'}
          </span>
          <button
            type="button"
            onClick={() => setPage('prescription')}
            className="ms-auto flex items-center gap-1 rounded-lg border border-base-300 px-2 py-1 text-[10px] font-medium text-base-content/60 transition hover:bg-base-200"
          >
            <Pill className="size-3" /> نسخه الکترونیک جدید <ArrowRight className="size-3" />
          </button>
        </div>
      </div>

      <Card padded={false}>
        <div className="p-4 pb-0">
          <Tabs
            items={[
              { id: 'visits', label: 'سوابق ویزیت', icon: FileHeart, count: myVisits.length },
              { id: 'rx', label: 'نسخ الکترونیک', icon: Pill, count: myPrescriptions.length },
              { id: 'vitals', label: 'علائم حیاتی', icon: Activity, count: myVitals.length },
              { id: 'labs', label: 'آزمایش و تصویربرداری', icon: FlaskConical, count: labPanel.length + requestedImaging.length },
              { id: 'referrals', label: 'ارجاعات', icon: ClipboardList, count: myReferrals.length },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        <div className="p-4">
          {tab === 'visits' ? (
            myVisits.length ? (
              <div className="space-y-3">
                {myVisits.map((visit) => {
                  const doctor = getDoctor(visit.doctorId);
                  return (
                    <div key={visit.id} className="relative rounded-xl border border-base-300/60 p-3 ps-5">
                      <span className="absolute inset-y-3 right-1.5 w-0.5 rounded-full bg-primary/30" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={doctor?.name ?? 'پزشک'} size="xs" />
                          <div>
                            <p className="text-[11px] font-bold text-base-content">{doctor?.name}</p>
                            <p className="text-[9px] text-base-content/40">{doctor?.specialty}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-base-content/45">{faShortDate(visit.date)}</span>
                      </div>
                      <div className="mt-2 grid gap-1.5 text-[11px] sm:grid-cols-2">
                        <p className="text-base-content/60">
                          <span className="font-medium text-base-content/80">شرح حال: </span>
                          {visit.chiefComplaint}
                        </p>
                        <p className="text-base-content/60">
                          <span className="font-medium text-base-content/80">تشخیص: </span>
                          {visit.diagnosis} <span className="text-[9px] text-base-content/35">({visit.icd})</span>
                        </p>
                      </div>
                      <p className="mt-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5 text-[10px] leading-5 text-base-content/55">
                        {visit.notes}
                      </p>
                      <p className="mt-1 text-[9px] text-base-content/40">پیگیری: {visit.followUp}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={FileHeart} title="سابقه ویزیتی ثبت نشده است" description="اولین ویزیت این بیمار را از دکمه «ثبت ویزیت» آغاز کنید." />
            )
          ) : null}

          {tab === 'rx' ? (
            myPrescriptions.length ? (
              <div className="space-y-3">
                {myPrescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-xl border border-base-300/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Pill className="size-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold text-base-content">{rx.diagnosis}</p>
                          <p className="font-mono text-[9px] text-base-content/40" dir="ltr">{rx.code}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-base-content/45">{faShortDate(rx.date)}</span>
                    </div>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {rx.items.map((item) => (
                        <div key={item.name} className="rounded-lg bg-base-200/50 px-2.5 py-1.5 text-[10px]">
                          <p className="font-medium text-base-content/75">{item.name}</p>
                          <p className="text-base-content/45">{item.dose} · {item.duration}</p>
                        </div>
                      ))}
                    </div>
                    {rx.labs.length || rx.imaging.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rx.labs.map((lab) => (
                          <Badge key={lab} tone="info">{lab}</Badge>
                        ))}
                        {rx.imaging.map((img) => (
                          <Badge key={img} tone="secondary">{img}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Pill} title="نسخه‌ای برای این بیمار ثبت نشده" description="با ورود به بخش نسخه الکترونیک، نسخه جدید صادر کنید." />
            )
          ) : null}

          {tab === 'vitals' ? (
            myVitals.length ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: 'فشار خون', value: latestVital?.bloodPressure ?? '—', icon: HeartPulse, tone: 'text-rose-500' },
                    { label: 'نبض', value: latestVital ? `${faDigits(latestVital.pulse)} /دقیقه` : '—', icon: Activity, tone: 'text-indigo-500' },
                    { label: 'دمای بدن', value: latestVital ? `${faDigits(latestVital.temperature)}°C` : '—', icon: Thermometer, tone: 'text-amber-500' },
                    { label: 'اشباع اکسیژن', value: latestVital ? `${faDigits(latestVital.spo2)}٪` : '—', icon: Droplets, tone: 'text-sky-500' },
                    { label: 'قند خون', value: latestVital ? `${faDigits(latestVital.glucose)} mg/dL` : '—', icon: FlaskConical, tone: 'text-emerald-500' },
                    { label: 'شاخص توده بدنی', value: latestVital ? faDigits(latestVital.bmi) : '—', icon: Weight, tone: 'text-purple-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-xl border border-base-300/60 p-2.5">
                        <Icon className={`size-4 ${item.tone}`} />
                        <p className="mt-1.5 text-[11px] font-bold text-base-content">{item.value}</p>
                        <p className="text-[9px] text-base-content/40">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-xs">
                    <thead>
                      <tr className="text-[10px] text-base-content/45">
                        <th className="font-medium">تاریخ</th>
                        <th className="font-medium">فشار خون</th>
                        <th className="font-medium">نبض</th>
                        <th className="font-medium">دما</th>
                        <th className="font-medium">SpO₂</th>
                        <th className="font-medium">وزن / قد</th>
                        <th className="font-medium">BMI</th>
                        <th className="font-medium">ثبت‌کننده</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myVitals.map((v) => (
                        <tr key={v.id} className="border-base-300/50">
                          <td className="text-[10px]">{v.recordedAt}</td>
                          <td className="text-[10px]">{v.bloodPressure}</td>
                          <td className="text-[10px]">{faDigits(v.pulse)}</td>
                          <td className="text-[10px]">{faDigits(v.temperature)}</td>
                          <td className="text-[10px]">{faDigits(v.spo2)}٪</td>
                          <td className="text-[10px]">{faDigits(v.weight)} / {faDigits(v.height)}</td>
                          <td className="text-[10px]">{faDigits(v.bmi)}</td>
                          <td className="text-[10px] text-base-content/50">{v.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState icon={Activity} title="علائم حیاتی ثبت نشده است" description="پرستار تریاژ می‌تواند علائم حیاتی بیمار را پیش از ویزیت ثبت کند." />
            )
          ) : null}

          {tab === 'labs' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <CardHeader title="نتایج آزمایشگاه" subtitle="آخرین نمونه‌گیری — آزمایشگاه مرکزی بیمارستان" icon={FlaskConical} />
                <div className="overflow-x-auto">
                  <table className="table table-xs">
                    <thead>
                      <tr className="text-[10px] text-base-content/45">
                        <th className="font-medium">آزمایش</th>
                        <th className="font-medium">نتیجه</th>
                        <th className="font-medium">محدوده نرمال</th>
                        <th className="font-medium">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labPanel.map((row) => (
                        <tr key={row.test} className="border-base-300/50">
                          <td className="text-[10px] font-medium" dir="ltr">{row.test}</td>
                          <td className="text-[10px]" dir="ltr">{row.result} <span className="text-[8px] text-base-content/35">{row.unit}</span></td>
                          <td className="text-[9px] text-base-content/45" dir="ltr">{row.range}</td>
                          <td>
                            <Badge tone={row.status === 'طبیعی' ? 'success' : row.status === 'مرزی' ? 'warning' : 'error'}>
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {requestedLabs.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] text-base-content/40">درخواست‌های در انتظار:</span>
                    {requestedLabs.slice(0, 4).map((lab) => (
                      <Badge key={lab} tone="info">{lab}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <CardHeader title="تصویربرداری و گزارش‌ها" subtitle="آخرین بررسی‌های پاراکلینیک" icon={ScanLine} />
                <div className="space-y-2">
                  {imagingReports.map((report) => (
                    <div key={report.id} className="rounded-xl border border-base-300/60 p-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-base-content">{report.title}</p>
                        <Badge tone={report.status === 'نتیجه آماده' ? 'success' : 'warning'}>{report.status}</Badge>
                      </div>
                      <p className="mt-1 text-[10px] leading-5 text-base-content/50">{report.result}</p>
                      <p className="mt-1 text-[9px] text-base-content/35">{faShortDate(report.date)} · {report.doctor}</p>
                    </div>
                  ))}
                  {requestedImaging.map((img) => (
                    <div key={img} className="rounded-xl border border-dashed border-base-300 p-2.5 text-[10px] text-base-content/50">
                      {img} — درخواست ثبت‌شده، در انتظار پذیرش پاراکلینیک
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'referrals' ? (
            myReferrals.length ? (
              <div className="space-y-2">
                {myReferrals.map((ref) => (
                  <div key={ref.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300/60 p-3">
                    <div>
                      <p className="text-[11px] font-semibold text-base-content">{ref.to}</p>
                      <p className="mt-0.5 text-[10px] text-base-content/50">{ref.reason}</p>
                      <p className="mt-1 text-[9px] text-base-content/35">{faShortDate(ref.date)} · ارجاع توسط {ref.fromDoctor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={ref.priority === 'فوری' ? 'error' : 'neutral'}>{ref.priority}</Badge>
                      <Badge tone={ref.status === 'پذیرفته‌شده' ? 'success' : 'warning'} dot>{ref.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="ارجاعی برای این بیمار ثبت نشده"
                description="در بخش ثبت ویزیت می‌توانید ارجاع درون‌بیمارستانی صادر کنید."
                action={
                  <button type="button" onClick={() => setPage('visit')} className="btn btn-sm btn-primary rounded-xl text-xs">
                    ثبت ارجاع
                  </button>
                }
              />
            )
          ) : null}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300/60 bg-base-100 px-4 py-2.5 text-[10px] text-base-content/45">
        <span className="flex items-center gap-1">
          <FileText className="size-3" /> تاریخ آخرین به‌روزرسانی پرونده: امروز — {doctors.find((d) => d.id === doctorId)?.name ?? 'دکتر معالج'}
        </span>
        <span>دسترسی به پرونده مطابق سطح دسترسی پزشک و قوانین محرمانگی اطلاعات سلامت</span>
      </div>
    </div>
  );
}
