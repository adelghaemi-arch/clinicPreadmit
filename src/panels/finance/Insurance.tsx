import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  FileWarning,
  RefreshCw,
  Send,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { useApp } from '../../store/AppStore';
import { getPatient, insuranceStats } from '../../data/mock';
import { faDigits, faShortDate, money, num, sum, todayIso } from '../../lib/utils';
import { DocStatusBadge } from '../../components/clinic/ClinicBits';
import { HBar } from '../../components/charts/Charts';

export function FinanceInsurance() {
  const { insuranceDocs, submitInsuranceDoc, submitInsuranceDocs, notify } = useApp();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const today = todayIso();

  const filtered = useMemo(
    () =>
      insuranceDocs.filter((doc) => {
        if (filter === 'all') return true;
        return doc.status === filter;
      }),
    [insuranceDocs, filter],
  );

  const drafts = insuranceDocs.filter((d) => d.status === 'پیش‌نویس');
  const sent = insuranceDocs.filter((d) => d.status === 'ارسال‌شده');
  const accepted = insuranceDocs.filter((d) => d.status === 'پذیرفته‌شده');
  const todayDocs = insuranceDocs.filter((d) => d.date === today);

  const toggle = (id: string) => {
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  };

  const bulkSend = () => {
    const ids = selected.filter((id) => insuranceDocs.find((d) => d.id === id)?.status === 'پیش‌نویس');
    if (!ids.length) {
      notify('warning', 'سندی برای ارسال انتخاب نشده', 'فقط اسناد پیش‌نویس قابل ارسال هستند.');
      return;
    }
    submitInsuranceDocs(ids);
    setSelected([]);
    notify('success', 'اسناد بیمه‌ای ارسال شد', `${faDigits(ids.length)} سند با موفقیت به سامانه بیمه ارسال شد.`);
  };

  const insurerTotals = ['تأمین اجتماعی', 'بیمه سلامت', 'بیمه تکمیلی دانا', 'بیمه تکمیلی آسیا'].map((insurer) => ({
    insurer,
    amount: sum(insuranceDocs.filter((d) => d.insurer === insurer).map((d) => d.amount)),
  }));
  const maxInsurer = Math.max(...insurerTotals.map((i) => i.amount), 1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="رسیدگی به اسناد بیمه‌ای"
        description="ثبت و استعلام آنلاین اسناد بیمه پایه و تکمیلی، پیگیری مطالبات و رفع مغایرت اسناد."
        badge={<Badge tone="info" dot>اتصال به سامانه‌های بیمه</Badge>}
        actions={
          <button
            type="button"
            onClick={bulkSend}
            className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
            disabled={selected.length === 0}
          >
            <Send className="size-3.5" /> ارسال انتخاب‌شده‌ها ({faDigits(selected.length)})
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="اسناد امروز" value={num(todayDocs.length)} icon={FileCheck2} tone="teal" hint="ثبت‌شده در سامانه" />
        <StatCard label="در انتظار ارسال" value={num(drafts.length)} icon={FileWarning} tone="amber" hint="پیش‌نویس نیازمند بازبینی" />
        <StatCard label="ارسال‌شده" value={num(sent.length)} icon={Send} tone="sky" hint="در انتظار پاسخ بیمه" />
        <StatCard label="مطالبات پذیرفته‌شده" value={money(sum(accepted.map((d) => d.amount)))} icon={ShieldCheck} tone="emerald" hint={`${faDigits(accepted.length)} سند تأییدشده`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-3">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardHeader className="mb-0" title="لیست اسناد بیمه‌ای" subtitle="سوابق ارسال و وضعیت رسیدگی" icon={FileCheck2} />
            <Tabs
              items={[
                { id: 'all', label: 'همه' },
                { id: 'پیش‌نویس', label: 'پیش‌نویس', count: drafts.length },
                { id: 'ارسال‌شده', label: 'ارسال‌شده', count: sent.length },
                { id: 'پذیرفته‌شده', label: 'پذیرفته‌شده', count: accepted.length },
                { id: 'رد‌شده', label: 'رد‌شده', count: insuranceDocs.filter((d) => d.status === 'رد‌شده').length },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[10px] text-base-content/45">
                  <th className="w-8 font-medium">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-xs"
                      checked={filtered.length > 0 && filtered.every((d) => selected.includes(d.id))}
                      onChange={(e) => {
                        if (e.target.checked) setSelected(Array.from(new Set([...selected, ...filtered.map((d) => d.id)])));
                        else setSelected(selected.filter((id) => !filtered.some((d) => d.id === id)));
                      }}
                      aria-label="انتخاب همه"
                    />
                  </th>
                  <th className="font-medium">شماره سند</th>
                  <th className="font-medium">بیمار</th>
                  <th className="font-medium">بیمه‌گر</th>
                  <th className="font-medium">نوع</th>
                  <th className="font-medium">مبلغ</th>
                  <th className="font-medium">تاریخ</th>
                  <th className="font-medium">وضعیت</th>
                  <th className="font-medium">کد رهگیری</th>
                  <th className="font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="border-base-300/50 transition hover:bg-base-200/30">
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-xs"
                        checked={selected.includes(doc.id)}
                        onChange={() => toggle(doc.id)}
                        aria-label={`انتخاب سند ${doc.no}`}
                      />
                    </td>
                    <td className="text-[10px] font-medium" dir="ltr">{doc.no}</td>
                    <td className="text-[11px]">{getPatient(doc.patientId)?.name}</td>
                    <td className="text-[10px] text-base-content/60">{doc.insurer}</td>
                    <td>
                      <Badge tone={doc.kind === 'پایه' ? 'success' : 'secondary'}>{doc.kind}</Badge>
                    </td>
                    <td className="text-[11px] font-medium">{money(doc.amount)}</td>
                    <td className="text-[10px] text-base-content/45">{faShortDate(doc.date)}</td>
                    <td><DocStatusBadge status={doc.status} /></td>
                    <td className="text-[9px] text-base-content/40" dir="ltr">{doc.trackingCode ?? '—'}</td>
                    <td>
                      {doc.status === 'پیش‌نویس' ? (
                        <button
                          type="button"
                          onClick={() => {
                            submitInsuranceDoc(doc.id);
                            notify('success', 'سند به بیمه ارسال شد', doc.no);
                          }}
                          className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20"
                        >
                          ارسال
                        </button>
                      ) : doc.status === 'رد‌شده' ? (
                        <button
                          type="button"
                          onClick={() => {
                            submitInsuranceDoc(doc.id);
                            notify('warning', 'سند اصلاح و ارسال مجدد شد', doc.no);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1 text-[10px] font-medium text-warning hover:bg-warning/20"
                        >
                          <RefreshCw className="size-2.5" /> اصلاح
                        </button>
                      ) : (
                        <span className="text-[9px] text-base-content/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-base-300/60 pt-2 text-[10px] text-base-content/40">
            <span>{faDigits(filtered.length)} سند نمایش داده شده</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-success" /> استعلام خودکار سند بیمه پایه فعال است</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="مطالبات به تفکیک بیمه‌گر" subtitle="مجموع مبالغ اسناد" icon={Wallet} />
            <div className="space-y-3">
              {insurerTotals.map((item) => (
                <HBar
                  key={item.insurer}
                  label={item.insurer}
                  value={item.amount}
                  max={maxInsurer}
                  suffix=" تومان"
                  color="bg-primary"
                />
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-info/5 px-3 py-2 text-[10px] leading-5 text-info">
              بیشترین سهم مطالبات مربوط به بیمه تأمین اجتماعی است.
            </p>
          </Card>

          <Card>
            <CardHeader title="سهم بیمه‌ها از مراجعین" subtitle="ترکیب پوشش بیمه‌ای" icon={ShieldCheck} />
            <div className="space-y-2">
              {insuranceStats.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-[10px]">
                  <span className="flex-1 text-base-content/55">{item.label}</span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-base-200">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                  <span className="w-7 text-left font-medium">{faDigits(item.value)}٪</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
