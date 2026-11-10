import { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Printer,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { useApp } from '../../store/AppStore';
import { getPatient, insuranceDocs, monthlyRevenue } from '../../data/mock';
import { faDigits, money, num, sum, todayIso, toEnDigits } from '../../lib/utils';
import { TrendChart } from '../../components/charts/Charts';
import { InvoiceStatusBadge } from '../../components/clinic/ClinicBits';

export function FinanceReports() {
  const { invoices, notify, user } = useApp();
  const today = todayIso();
  const [counted, setCounted] = useState('');
  const [closed, setClosed] = useState(false);

  const todayInvoices = invoices.filter((i) => i.date === today);
  const paid = todayInvoices.filter((i) => i.paidAmount > 0);

  const byMethod = (method: string) =>
    sum(paid.filter((i) => i.method === method).map((i) => i.paidAmount));

  const cash = byMethod('نقدی');
  const card = byMethod('کارت‌خوان');
  const online = byMethod('درگاه آنلاین');
  const collected = cash + card + online;
  const opening = 2_500_000;
  const expected = opening + collected;
  const hasCount = counted.trim() !== '';
  const countedValue = hasCount ? Number(toEnDigits(counted).replace(/,/g, '')) : 0;
  const difference = hasCount ? countedValue - expected : 0;
  const claims = sum(insuranceDocs.filter((d) => d.status !== 'رد‌شده').map((d) => d.amount));

  const closeDrawer = () => {
    if (!hasCount) {
      notify('warning', 'شمارش صندوق انجام نشده', 'مبلغ موجودی شمارش‌شده را وارد کنید.');
      return;
    }
    setClosed(true);
    if (difference === 0) {
      notify('success', 'صندوق با موفقیت بسته شد', 'گزارش روزانه ثبت و برای مدیریت ارسال شد.');
    } else {
      notify(
        'warning',
        'صندوق با مغایرت بسته شد',
        `${difference > 0 ? 'اضافه صندوق' : 'کسر صندوق'}: ${money(Math.abs(difference))}`,
      );
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="گزارش مالی و بستن صندوق"
        description="مغایرت‌گیری دستگاه‌های پز با تراکنش‌های سیستم، گزارش درآمد روزانه و بستن صندوق."
        badge={
          closed ? (
            <Badge tone="success" dot>صندوق بسته شد</Badge>
          ) : (
            <Badge tone="warning" dot>صندوق باز</Badge>
          )
        }
        actions={
          <button
            type="button"
            onClick={() => notify('info', 'چاپ گزارش روزانه', 'گزارش درآمد و تراکنش‌های امروز آماده چاپ شد.')}
            className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
          >
            <Printer className="size-3.5" /> چاپ گزارش
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="دریافتی امروز" value={money(collected)} icon={Wallet} tone="emerald" hint="کل تراکنش‌های موفق" />
        <StatCard label="تعداد تراکنش" value={num(paid.length)} icon={Receipt} tone="teal" hint="نقدی، کارت و آنلاین" />
        <StatCard label="مطالبات بیمه" value={money(claims)} icon={TrendingUp} tone="sky" hint="اسناد در جریان و پذیرفته‌شده" />
        <StatCard
          label="مغایرت صندوق"
          value={hasCount ? money(Math.abs(difference)) : '—'}
          icon={Banknote}
          tone={hasCount ? (difference === 0 ? 'emerald' : 'amber') : 'sky'}
          hint={hasCount ? (difference === 0 ? 'بدون مغایرت' : difference > 0 ? 'اضافه صندوق' : 'کسر صندوق') : 'در انتظار شمارش'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="بستن صندوق روزانه"
            subtitle={`${faDigits(today.replace(/-/g, '/'))} — صندوقدار: ${user?.name}`}
            icon={LockKeyhole}
            action={closed ? <Badge tone="success">ثبت نهایی</Badge> : <Badge tone="warning">در جریان</Badge>}
          />
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: 'نقدی', value: cash, icon: Banknote, tone: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'کارت‌خوان', value: card, icon: CreditCard, tone: 'text-sky-500', bg: 'bg-sky-500/10' },
              { label: 'درگاه آنلاین', value: online, icon: Wallet, tone: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-base-300/60 p-2.5">
                  <span className={`grid size-7 place-items-center rounded-lg ${item.bg} ${item.tone}`}>
                    <Icon className="size-3.5" />
                  </span>
                  <p className="mt-1.5 text-[11px] font-bold text-base-content">{money(item.value)}</p>
                  <p className="text-[9px] text-base-content/40">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-1.5 rounded-xl bg-base-200/50 p-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-base-content/50">موجودی ابتدای روز</span>
              <span className="font-medium">{money(opening)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/50">جمع دریافتی امروز</span>
              <span className="font-medium text-success">{money(collected)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-base-300 pt-1.5">
              <span className="font-semibold text-base-content">موجودی نقدی مورد انتظار</span>
              <span className="font-extrabold">{money(expected)}</span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-base-content/60">موجودی شمارش‌شده (تومان)</span>
              <input
                value={counted}
                onChange={(e) => setCounted(e.target.value.replace(/[^\d۰-۹]/g, ''))}
                placeholder={faDigits(expected.toLocaleString('en-US'))}
                className="input input-sm h-10 w-full rounded-xl border-base-300 bg-base-100 text-xs"
                dir="ltr"
                inputMode="numeric"
              />
            </label>
            <div className={`rounded-xl border p-2.5 ${hasCount ? (difference === 0 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5') : 'border-base-300 bg-base-200/40'}`}>
              <p className="text-[10px] text-base-content/45">مغایرت محاسبه‌شده</p>
              <p className={`mt-1 text-sm font-extrabold ${hasCount ? (difference === 0 ? 'text-success' : 'text-warning') : 'text-base-content/40'}`}>
                {hasCount ? `${difference > 0 ? '+' : difference < 0 ? '−' : ''}${money(Math.abs(difference))}` : '—'}
              </p>
              <p className="mt-0.5 text-[9px] text-base-content/40">
                {hasCount
                  ? difference === 0
                    ? 'تراکنش‌ها با دستگاه پز مطابقت دارد.'
                    : difference > 0
                      ? 'اضافه صندوق — بررسی تراکنش‌های نقدی.'
                      : 'کسر صندوق — بررسی رسیدهای پرداخت.'
                  : 'مبلغ شمارش‌شده را وارد کنید.'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-base-300/60 pt-3">
            <span className="text-[10px] text-base-content/40">
              {faDigits(paid.length)} تراکنش موفق در {faDigits(todayInvoices.length)} فاکتور
            </span>
            <button
              type="button"
              onClick={closeDrawer}
              disabled={closed}
              className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs disabled:opacity-60"
            >
              <CheckCircle2 className="size-3.5" />
              {closed ? 'صندوق بسته شده است' : 'بستن صندوق و ثبت گزارش'}
            </button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="روند درآمد کلینیک" subtitle="میلیون تومان — ۸ ماه اخیر" icon={TrendingUp} />
            <TrendChart data={monthlyRevenue.map((m) => ({ label: m.month, value: m.value }))} height={150} color="#10b981" />
          </Card>

          <Card>
            <CardHeader title="وضعیت اسناد بیمه" subtitle="مطالبات در جریان" icon={Receipt} />
            <div className="space-y-2 text-[10px]">
              {[
                ['پیش‌نویس', insuranceDocs.filter((d) => d.status === 'پیش‌نویس').length, 'bg-warning'],
                ['ارسال‌شده', insuranceDocs.filter((d) => d.status === 'ارسال‌شده').length, 'bg-info'],
                ['پذیرفته‌شده', insuranceDocs.filter((d) => d.status === 'پذیرفته‌شده').length, 'bg-success'],
                ['رد‌شده', insuranceDocs.filter((d) => d.status === 'رد‌شده').length, 'bg-error'],
              ].map(([label, count, color]) => (
                <div key={String(label)} className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${color}`} />
                  <span className="flex-1 text-base-content/55">{label}</span>
                  <span className="font-semibold text-base-content">{faDigits(Number(count))}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="تراکنش‌های امروز"
          subtitle="سوابق پرداخت‌های ثبت‌شده در صندوق"
          icon={Receipt}
          action={<Badge tone="neutral">{faDigits(paid.length)} تراکنش</Badge>}
        />
        {paid.length ? (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[10px] text-base-content/45">
                  <th className="font-medium">فاکتور</th>
                  <th className="font-medium">بیمار</th>
                  <th className="font-medium">مبلغ</th>
                  <th className="font-medium">روش پرداخت</th>
                  <th className="font-medium">صندوقدار</th>
                  <th className="font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {paid.map((invoice) => (
                  <tr key={invoice.id} className="border-base-300/50">
                    <td className="text-[10px] font-medium" dir="ltr">{invoice.no}</td>
                    <td className="text-[11px]">{getPatient(invoice.patientId)?.name}</td>
                    <td className="text-[11px] font-medium text-success">{money(invoice.paidAmount)}</td>
                    <td className="text-[10px] text-base-content/60">{invoice.method}</td>
                    <td className="text-[10px] text-base-content/45">{invoice.cashier ?? user?.name}</td>
                    <td><InvoiceStatusBadge status={invoice.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-[11px] text-base-content/40">تراکنشی برای امروز ثبت نشده است.</p>
        )}
        <p className="mt-2 text-[9px] text-base-content/35">
          مبالغ به تومان · مطابقت با دستگاه‌های پز در پایان روز الزامی است.
        </p>
      </Card>
    </div>
  );
}
