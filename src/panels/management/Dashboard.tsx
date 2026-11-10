import {
  ArrowLeft,
  Clock3,
  Download,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { HBar, Donut, DonutLegend, TrendChart } from '../../components/charts/Charts';
import { useApp } from '../../store/AppStore';
import {
  doctors,
  insuranceStats,
  monthlyRevenue,
  specialtyStats,
  waitTimeByHour,
} from '../../data/mock';
import { faDigits, faFullDate, faWeekday, money, num, sum, todayIso } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';
import { StatusDot } from '../../components/ui/Badge';

export function ManagementDashboard() {
  const { appointments, invoices, patients, notify } = useApp();
  const today = todayIso();
  const todayAppointments = appointments.filter((a) => a.date === today);
  const visitsToday = todayAppointments.filter((a) => a.status !== 'canceled');
  const doneToday = todayAppointments.filter((a) => a.status === 'done').length;
  const revenueToday = sum(
    invoices.filter((i) => i.date === today).map((i) => i.paidAmount),
  );
  const unpaidToday = invoices.filter((i) => i.date === today && i.status !== 'تسویه‌شده').length;
  const totalCapacity = sum(doctors.map((d) => d.capacity));
  const occupancy = Math.round((visitsToday.length / totalCapacity) * 100);
  const avgWait = Math.round(sum(waitTimeByHour.map((w) => w.minutes)) / waitTimeByHour.length);
  const weekday = faWeekday(today);

  const maxSpecialty = Math.max(...specialtyStats.map((s) => s.visits));

  return (
    <div className="space-y-5">
      <PageHeader
        title="داشبورد مدیریتی"
        description={`نمای کلان عملکرد کلینیک در ${faFullDate(today)} — شاخص‌ها به‌صورت زنده از داده‌های نمونه محاسبه می‌شوند.`}
        badge={<Badge tone="success" dot>سامانه فعال</Badge>}
        actions={
          <>
            <button
              type="button"
              onClick={() => notify('success', 'گزارش روزانه آماده شد', 'فایل خروجی در نسخه نمایشی شبیه‌سازی شده است.')}
              className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs font-medium"
            >
              <Download className="size-3.5" /> خروجی گزارش
            </button>
            <button
              type="button"
              onClick={() => notify('info', 'شاخص‌ها به‌روزرسانی شد', 'آخرین داده‌های امروز بارگذاری شد.')}
              className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs font-medium"
            >
              <RefreshCw className="size-3.5" /> به‌روزرسانی
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="ویزیت‌های امروز"
          value={`${num(visitsToday.length)} نوبت`}
          hint={`${faDigits(doneToday)} ویزیت تکمیل‌شده`}
          icon={Stethoscope}
          tone="teal"
          trend={{ value: '۱۲٪', up: true }}
        />
        <StatCard
          label="درآمد وصول‌شده امروز"
          value={money(revenueToday)}
          hint={`${faDigits(unpaidToday)} فاکتور در انتظار تسویه`}
          icon={Wallet}
          tone="emerald"
          trend={{ value: '۸٪', up: true }}
        />
        <StatCard
          label="ضریب اشغال پزشکان"
          value={`${num(occupancy)}٪`}
          hint={`ظرفیت امروز: ${num(totalCapacity)} نوبت`}
          icon={Users}
          tone="indigo"
          trend={{ value: '۳٪', up: true }}
        />
        <StatCard
          label="میانگین زمان انتظار"
          value={`${num(avgWait)} دقیقه`}
          hint="هدف کلینیک: زیر ۲۰ دقیقه"
          icon={Clock3}
          tone="amber"
          trend={{ value: '۵٪', up: false }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="روند درآمد ماهانه"
            subtitle="مجموع درآمد وصول‌شده کلینیک (میلیون تومان)"
            icon={TrendingUp}
            action={
              <Badge tone="success" dot>
                رشد ۱۴٪ نسبت به ماه قبل
              </Badge>
            }
          />
          <TrendChart
            data={monthlyRevenue.map((m) => ({ label: m.month, value: m.value }))}
            suffix="میلیون تومان"
            color="#0f766e"
          />
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-base-300/60 pt-3 text-center">
            <div>
              <p className="text-[10px] text-base-content/45">جمع ۸ ماه</p>
              <p className="text-sm font-bold text-base-content">
                {num(sum(monthlyRevenue.map((m) => m.value)))} میلیون
              </p>
            </div>
            <div>
              <p className="text-[10px] text-base-content/45">میانگین ماهانه</p>
              <p className="text-sm font-bold text-base-content">
                {num(Math.round(sum(monthlyRevenue.map((m) => m.value)) / monthlyRevenue.length))} میلیون
              </p>
            </div>
            <div>
              <p className="text-[10px] text-base-content/45">بهترین ماه</p>
              <p className="text-sm font-bold text-success">آبان</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="سهم بیمه‌ها" subtitle="ترکیب مراجعین بر اساس نوع پوشش بیمه‌ای" icon={Wallet} />
          <div className="flex flex-col items-center gap-4">
            <Donut
              segments={insuranceStats.map((s) => ({ ...s, color: getInsuranceColor(s.label) }))}
              centerValue="۱۰۰٪"
              centerLabel="سهم پوشش"
              size={156}
            />
            <div className="w-full">
              <DonutLegend
                suffix="٪"
                segments={insuranceStats.map((s) => ({ ...s, color: getInsuranceColor(s.label) }))}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="عملکرد پزشکان امروز"
            subtitle={`برنامه شیفت ${weekday} و ظرفیت نوبت‌دهی`}
            icon={Stethoscope}
            action={
              <span className="flex items-center gap-1 text-[10px] text-base-content/45">
                <StatusDot tone="success" pulse /> در حال به‌روزرسانی
              </span>
            }
          />
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[10px] text-base-content/45">
                  <th className="font-medium">پزشک</th>
                  <th className="font-medium">شیفت امروز</th>
                  <th className="font-medium">نوبت‌ها</th>
                  <th className="w-32 font-medium">اشغال ظرفیت</th>
                  <th className="font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => {
                  const doctorVisits = todayAppointments.filter(
                    (a) => a.doctorId === doctor.id && a.status !== 'canceled',
                  ).length;
                  const ratio = Math.round((doctorVisits / doctor.capacity) * 100);
                  const shift = doctor.shifts.find((s) => s.day === weekday) ?? doctor.shifts[0];
                  const busy = todayAppointments.some(
                    (a) => a.doctorId === doctor.id && a.status === 'in-progress',
                  );
                  return (
                    <tr key={doctor.id} className="border-base-300/50">
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={doctor.name} size="xs" />
                          <div>
                            <p className="text-[11px] font-semibold text-base-content">{doctor.name}</p>
                            <p className="text-[10px] text-base-content/45">{doctor.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-[10px] text-base-content/60">{shift?.hours ?? 'بدون شیفت'}</td>
                      <td className="text-[11px] font-medium whitespace-nowrap">
                        {faDigits(doctorVisits)}
                        <span className="text-base-content/35"> از {faDigits(doctor.capacity)}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200">
                            <div
                              className={ratio > 85 ? 'h-full bg-warning' : 'h-full bg-primary'}
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-base-content/45">{num(ratio)}٪</span>
                        </div>
                      </td>
                      <td>
                        {busy ? (
                          <Badge tone="primary" dot>در حال ویزیت</Badge>
                        ) : shift ? (
                          <Badge tone="success">حاضر</Badge>
                        ) : (
                          <Badge tone="neutral">غیرحاضر</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="آمار مراجعین به تفکیک تخصص" subtitle="تعداد ویزیت در ماه جاری" icon={Users} />
            <div className="space-y-3">
              {specialtyStats.slice(0, 5).map((item) => (
                <HBar
                  key={item.label}
                  label={item.label}
                  value={item.visits}
                  max={maxSpecialty}
                  color={item.color}
                />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="هشدارهای عملیاتی" subtitle="موارد نیازمند بررسی مدیر" icon={Clock3} />
            <ul className="space-y-2 text-[11px]">
              {[
                { text: `${faDigits(unpaidToday)} فاکتور تسویه‌نشده در صندوق امروز`, tone: 'warning' as const },
                {
                  text: `${faDigits(
                    appointments.filter((a) => a.date === today && a.status === 'arrived').length,
                  )} بیمار در انتظار تریاژ پرستاری`,
                  tone: 'info' as const,
                },
                { text: `${faDigits(patients.length)} پرونده فعال در کلینیک`, tone: 'success' as const },
                { text: 'ظرفیت نوبت‌دهی دکتر بهرام نیک‌پور تکمیل شده است', tone: 'error' as const },
              ].map((alert) => (
                <li key={alert.text} className="flex items-center gap-2 rounded-lg bg-base-200/50 px-2.5 py-2">
                  <StatusDot tone={alert.tone} />
                  <span className="flex-1 text-base-content/65">{alert.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => notify('info', 'مرکز هشدارها', 'در نسخه نمایشی، هشدارها از داده‌های ثابت خوانده می‌شوند.')}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-base-300 py-1.5 text-[11px] font-medium text-base-content/60 transition hover:bg-base-200"
            >
              مشاهده جزئیات <ArrowLeft className="size-3" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getInsuranceColor(insurance: string): string {
  const map: Record<string, string> = {
    'تأمین اجتماعی': '#14b8a6',
    'بیمه سلامت': '#0ea5e9',
    آزاد: '#f59e0b',
    'نیروهای مسلح': '#6366f1',
  };
  return map[insurance] ?? '#94a3b8';
}
