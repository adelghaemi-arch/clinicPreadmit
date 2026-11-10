import { useState } from 'react';
import {
  Activity,
  CalendarPlus,
  Download,
  FileText,
  FlaskConical,
  HeartPulse,
  Pill,
  ScanLine,
  Stethoscope,
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
import { faDigits, faShortDate, num } from '../../lib/utils';
import { InsuranceChip } from '../../components/clinic/ClinicBits';

const documents = [
  { id: 'd1', title: 'گزارش آزمایش CBC و فریتین', date: '1405-08-02', type: 'آزمایشگاه', status: 'آماده' },
  { id: 'd2', title: 'گزارش اکوکاردیوگرافی رنگی', date: '1405-07-28', type: 'تصویربرداری', status: 'آماده' },
  { id: 'd3', title: 'نوار قلب ۱۲ لید', date: '1405-08-18', type: 'پاراکلینیک', status: 'آماده' },
  { id: 'd4', title: 'نسخه الکترونیک — لوزارتان', date: '1405-08-02', type: 'نسخه', status: 'آماده' },
];

export function PatientRecords() {
  const { user, patients, visits, vitals, prescriptions, setPage, notify } = useApp();
  const patient = getPatient(user?.patientId ?? patients[0]?.id ?? 'p1') ?? patients[0]!;
  const [tab, setTab] = useState('visits');
  const myVisits = visits.filter((v) => v.patientId === patient.id);
  const myVitals = vitals.filter((v) => v.patientId === patient.id);
  const myRx = prescriptions.filter((p) => p.patientId === patient.id);
  const latest = myVitals[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="سوابق پزشکی من"
        description="تاریخچه ویزیت‌ها، نتایج آزمایش، تصویربرداری و علائم حیاتی ثبت‌شده در پرونده الکترونیک."
        badge={<Badge tone="success" dot>پرونده {patient.fileNo}</Badge>}
        actions={
          <button type="button" onClick={() => setPage('book')} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
            <CalendarPlus className="size-3.5" /> رزرو نوبت جدید
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ویزیت‌های ثبت‌شده" value={num(myVisits.length)} icon={Stethoscope} tone="rose" hint="از ابتدای تشکیل پرونده" />
        <StatCard label="نسخ الکترونیک" value={num(myRx.length)} icon={Pill} tone="indigo" hint="قابل ارائه به داروخانه" />
        <StatCard label="علائم حیاتی" value={num(myVitals.length)} icon={Activity} tone="amber" hint="آخرین ثبت: امروز" />
        <StatCard label="مدارک پزشکی" value={num(documents.length)} icon={FileText} tone="sky" hint="گزارش‌های قابل دانلود" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-base-300/70 bg-base-100 p-3 sm:flex-row sm:items-center">
        <Avatar name={patient.name} size="lg" />
        <div className="flex-1">
          <p className="text-sm font-bold text-base-content">{patient.name}</p>
          <p className="mt-0.5 text-[10px] text-base-content/45">
            {faDigits(patient.age)} ساله · {patient.gender} · گروه خونی {patient.blood} · کد ملی {faDigits(patient.nationalId)}
          </p>
          <div className="mt-1">
            <InsuranceChip kind={patient.insurance} supplementary={patient.supplementary} />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-base-200/60 px-3 py-2">
          <HeartPulse className="size-5 text-rose-500" />
          <div>
            <p className="text-[9px] text-base-content/45">فشار خون آخرین ویزیت</p>
            <p className="text-xs font-bold text-base-content">{latest?.bloodPressure ?? '—'}</p>
          </div>
        </div>
      </div>

      <Card padded={false}>
        <div className="p-4 pb-0">
          <Tabs
            items={[
              { id: 'visits', label: 'ویزیت‌ها', icon: Stethoscope, count: myVisits.length },
              { id: 'vitals', label: 'علائم حیاتی', icon: Activity, count: myVitals.length },
              { id: 'docs', label: 'مدارک پزشکی', icon: FileText, count: documents.length },
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
                    <div key={visit.id} className="rounded-xl border border-base-300/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={doctor?.name ?? ''} size="sm" />
                          <div>
                            <p className="text-[11px] font-bold text-base-content">{doctor?.name}</p>
                            <p className="text-[9px] text-base-content/40">{doctor?.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-base-content/45">{faShortDate(visit.date)}</span>
                          <Badge tone="success">{visit.status}</Badge>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 text-[11px] sm:grid-cols-2">
                        <div className="rounded-lg bg-base-200/50 px-2.5 py-1.5">
                          <p className="text-[9px] text-base-content/40">شرح حال</p>
                          <p className="mt-0.5 text-base-content/70">{visit.chiefComplaint}</p>
                        </div>
                        <div className="rounded-lg bg-base-200/50 px-2.5 py-1.5">
                          <p className="text-[9px] text-base-content/40">تشخیص</p>
                          <p className="mt-0.5 text-base-content/70">
                            {visit.diagnosis} <span className="text-[8px] text-base-content/35">({visit.icd})</span>
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] leading-5 text-base-content/55">{visit.notes}</p>
                      <p className="mt-1 text-[9px] text-base-content/35">پیگیری: {visit.followUp}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={Stethoscope} title="ویزیتی ثبت نشده است" description="پس از اولین ویزیت، سوابق در این بخش نمایش داده می‌شود." />
            )
          ) : null}

          {tab === 'vitals' ? (
            myVitals.length ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    ['فشار خون', latest?.bloodPressure ?? '—'],
                    ['نبض', latest ? `${faDigits(latest.pulse)}` : '—'],
                    ['دما', latest ? `${faDigits(latest.temperature)}°` : '—'],
                    ['SPO₂', latest ? `${faDigits(latest.spo2)}٪` : '—'],
                    ['قند خون', latest ? `${faDigits(latest.glucose)}` : '—'],
                    ['BMI', latest ? `${faDigits(latest.bmi)}` : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-base-200/50 px-2.5 py-2 text-center">
                      <p className="text-sm font-extrabold text-base-content">{value}</p>
                      <p className="text-[9px] text-base-content/40">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="text-[10px] text-base-content/45">
                        <th className="font-medium">ساعت ثبت</th>
                        <th className="font-medium">فشار خون</th>
                        <th className="font-medium">نبض</th>
                        <th className="font-medium">دما</th>
                        <th className="font-medium">اشباع اکسیژن</th>
                        <th className="font-medium">وزن / قد</th>
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
                          <td className="text-[10px] text-base-content/50">{v.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState icon={Activity} title="علائم حیاتی ثبت نشده" description="در مراجعه بعدی، پرستار علائم شما را ثبت خواهد کرد." />
            )
          ) : null}

          {tab === 'docs' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2.5 rounded-xl border border-base-300/60 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    {doc.type === 'نسخه' ? <Pill className="size-4" /> : doc.type === 'آزمایشگاه' ? <FlaskConical className="size-4" /> : <ScanLine className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-base-content">{doc.title}</p>
                    <p className="mt-0.5 text-[9px] text-base-content/40">{doc.type} · {faShortDate(doc.date)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => notify('info', 'دانلود مدرک', 'فایل PDF در نسخه نمایشی شبیه‌سازی شده است.')}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-base-300 text-base-content/50 transition hover:bg-base-200 hover:text-base-content"
                    aria-label="دانلود مدرک"
                  >
                    <Download className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="نسخه‌های فعال" subtitle="آخرین نسخ الکترونیک صادرشده" icon={Pill} />
        {myRx.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {myRx.slice(0, 2).map((rx) => (
              <div key={rx.id} className="rounded-xl border border-base-300/60 p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-base-content">{rx.diagnosis}</p>
                  <span className="text-[9px] text-base-content/35">{faShortDate(rx.date)}</span>
                </div>
                <p className="mt-1 flex flex-wrap gap-1">
                  {rx.items.map((item) => (
                    <Badge key={item.name} tone="primary">{item.name.split(' ').slice(0, 2).join(' ')}</Badge>
                  ))}
                </p>
                <button
                  type="button"
                  onClick={() => setPage('prescriptions')}
                  className="mt-2 flex items-center gap-1 text-[9px] font-medium text-primary hover:underline"
                >
                  مشاهده جزئیات نسخه <Download className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-base-content/40">نسخه فعالی وجود ندارد.</p>
        )}
      </Card>
    </div>
  );
}
