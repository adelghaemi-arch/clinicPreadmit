import { useState } from 'react';
import {
  BarChart3,
  Clock3,
  Download,
  FileSpreadsheet,
  Printer,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { HBar, Donut, DonutLegend, TrendChart } from '../../components/charts/Charts';
import { useApp } from '../../store/AppStore';
import { doctors, insuranceStats, monthlyRevenue, specialtyStats, waitTimeByHour } from '../../data/mock';
import { faDigits, money, num, sum, todayIso } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';
import { StatusDot } from '../../components/ui/Badge';

const ranges = [
  { id: 'today', label: 'امروز', factor: 1 },
  { id: 'week', label: '۷ روز اخیر', factor: 6 },
  { id: 'month', label: '۳۰ روز اخیر', factor: 26 },
  { id: 'year', label: 'سال جاری', factor: 312 },
];

const insuranceColors: Record<string, string> = {
  'تأمین اجتماعی': '#14b8a6',
  'بیمه سلامت': '#0ea5e9',
  آزاد: '#f59e0b',
  'نیروهای مسلح': '#6366f1',
};

export function ReportsPage() {
  const { invoices, appointments, patients, notify } = useApp();
  const [range, setRange] = useState('today');
  const current = ranges.find((r) => r.id === range) ?? ranges[0]!;
  const today = todayIso();
  const visitsToday = appointments.filter((a) => a.date === today && a.status !== 'canceled').length;
  const revenueToday = sum(invoices.filter((i) => i.date === today).map((i) => i.paidAmount));
  const totalVisits = visitsToday * current.factor;
  const totalRevenue = revenueToday * current.factor;
  const newFiles = Math.round(patients.length * 0.18 * current.factor);
  const noShow = Math.max(1, Math.round(totalVisits * 0.04));

  const maxWait = Math.max(...waitTimeByHour.map((w) => w.minutes));

  return (
    <div className="space-y-5">
      <PageHeader
        title="گزارش‌های عملکردی و آماری"
        description="تحلیل ویزیت‌ها، درآمد، بیمه‌ها و عملکرد پزشکان؛ خروجی قابل ارائه به مدیریت بیمارستان."
        badge={<Badge tone="info">دوره گزارش: {current.label}</Badge>}
        actions={
          <>
            <button
              type="button"
              onClick={() => notify('success', 'خروجی Excel آماده شد', 'در نسخه نمایشی دانلود شبیه‌سازی شده است.')}
              className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
            >
              <FileSpreadsheet className="size-3.5" /> Excel
            </button>
            <button
              type="button"
              onClick={() => notify('info', 'پیش‌نمایش چاپ', 'گزارش برای چاپ آماده شد.')}
              className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
            >
              <Printer className="size-3.5" /> چاپ گزارش
            </button>
          </>
        }
      />

      <Tabs
        items={ranges.map((r) => ({ id: r.id, label: r.label }))}
        value={range}
        onChange={setRange}
        className="w-fit"
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="ویزیت‌های انجام‌شده" value={num(totalVisits)} icon={Stethoscope} tone="teal" hint={`به‌طور میانگین ${num(visitsToday)} ویزیت در روز`} trend={{ value: '۹٪', up: true }} />
        <StatCard label="درآمد وصول‌شده" value={money(totalRevenue)} icon={Wallet} tone="emerald" hint="پس از کسر سهم بیمه" trend={{ value: '۱۴٪', up: true }} />
        <StatCard label="پرونده‌های جدید" value={num(newFiles)} icon={UserPlus} tone="sky" hint="بیماران بدون سابقه قبلی" trend={{ value: '۶٪', up: true }} />
        <StatCard label="نرخ عدم مراجعه" value={`${faDigits(Math.round((noShow / Math.max(totalVisits, 1)) * 100))}٪`} icon={Clock3} tone="rose" hint={`${num(noShow)} نوبت لغو یا بی‌پاسخ`} trend={{ value: '۲٪', up: false }} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="روند درآمد و ویزیت"
            subtitle="درآمد وصول‌شده ماهانه به میلیون تومان"
            icon={TrendingUp}
            action={<Badge tone="success" dot>روند صعودی</Badge>}
          />
          <TrendChart
            data={monthlyRevenue.map((m) => ({ label: m.month, value: m.value }))}
            suffix="میلیون تومان"
            color="#0f766e"
          />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['بیشترین درآمد', 'آبان'],
              ['کمترین درآمد', 'فروردین'],
              ['میانگین ویزیت روزانه', `${num(visitsToday)} نفر`],
              ['میانگین درآمد ویزیت', money(Math.round(totalRevenue / Math.max(totalVisits, 1)))],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-base-200/50 px-2.5 py-2">
                <p className="text-[9px] text-base-content/45">{label}</p>
                <p className="mt-0.5 text-[11px] font-bold text-base-content">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="ترکیب بیمه‌ای مراجعین" subtitle="سهم هر سازمان بیمه‌گر" icon={Wallet} />
          <div className="flex flex-col items-center gap-4">
            <Donut
              segments={insuranceStats.map((s) => ({ ...s, color: insuranceColors[s.label] ?? '#94a3b8' }))}
              centerValue="۱۰۰٪"
              centerLabel="کل مراجعین"
              size={150}
            />
            <div className="w-full">
              <DonutLegend
                suffix="٪"
                segments={insuranceStats.map((s) => ({ ...s, color: insuranceColors[s.label] ?? '#94a3b8' }))}
              />
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-info/5 px-3 py-2 text-[10px] leading-5 text-info">
            بیمه تأمین اجتماعی با ۴۶٪ بیشترین سهم مراجعین را دارد.
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="ویزیت به تفکیک تخصص" subtitle="تعداد ویزیت در دوره انتخابی" icon={BarChart3} />
          <div className="space-y-3">
            {specialtyStats.map((item) => (
              <HBar
                key={item.label}
                label={item.label}
                value={Math.round(item.visits * current.factor * 0.4)}
                max={Math.round(Math.max(...specialtyStats.map((s) => s.visits)) * current.factor * 0.4)}
                color={item.color}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="میانگین زمان انتظار در ساعات کاری" subtitle="دقیقه — بر اساس تریاژ تا ورود به اتاق پزشک" icon={Clock3} />
          <div className="space-y-3">
            {waitTimeByHour.map((item) => (
              <HBar
                key={item.hour}
                label={`ساعت ${item.hour}`}
                value={item.minutes}
                max={maxWait}
                color={item.minutes > 20 ? 'bg-warning' : 'bg-success'}
                suffix=" دقیقه"
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/5 px-3 py-2 text-[10px] leading-5 text-warning">
            <StatusDot tone="warning" />
            اوج شلوغی ساعت ۱۰ تا ۱۱ است؛ پیشنهاد: افزایش ظرفیت پذیرش در این بازه.
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="عملکرد پزشکان"
          subtitle="مقایسه ویزیت، درآمد و رضایت مراجعین"
          icon={Stethoscope}
          action={
            <button
              type="button"
              onClick={() => notify('info', 'دریافت گزارش پزشکان', 'خروجی عملکرد پزشکان آماده شد.')}
              className="flex items-center gap-1 rounded-lg border border-base-300 px-2 py-1 text-[10px] text-base-content/60 hover:bg-base-200"
            >
              <Download className="size-3" /> دریافت
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-[10px] text-base-content/45">
                <th className="font-medium">پزشک</th>
                <th className="font-medium">تخصص</th>
                <th className="font-medium">ویزیت دوره</th>
                <th className="font-medium">درآمد تخمینی</th>
                <th className="font-medium">رضایت</th>
                <th className="font-medium">نرخ بازگشت</th>
              </tr>
            </thead>
            <tbody>
              {doctors.slice(0, 6).map((doctor, index) => {
                const visits = Math.round((doctor.capacity * current.factor) / 1.6);
                return (
                  <tr key={doctor.id} className="border-base-300/50">
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={doctor.name} size="xs" />
                        <div>
                          <p className="text-[11px] font-medium">{doctor.name}</p>
                          <p className="text-[9px] text-base-content/40">{doctor.room}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[11px] text-base-content/60">{doctor.specialty}</td>
                    <td className="text-[11px] font-medium">{num(visits)}</td>
                    <td className="text-[11px] text-base-content/70">{money(visits * doctor.visitFee)}</td>
                    <td>
                      <span className="text-[11px] font-medium text-amber-500">⭐ {num(doctor.rating)}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-base-200">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${68 + index * 4}%` }} />
                        </div>
                        <span className="text-[9px] text-base-content/45">{faDigits(68 + index * 4)}٪</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
