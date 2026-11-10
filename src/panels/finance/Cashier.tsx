import { useMemo, useState } from 'react';
import {
  Banknote,
  CreditCard,
  FileText,
  Printer,
  Receipt,
  Search,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { getDoctor, getPatient } from '../../data/mock';
import { faDigits, invoiceTotal, money, num, sum, todayIso } from '../../lib/utils';
import { InvoiceStatusBadge, InsuranceChip } from '../../components/clinic/ClinicBits';

const methods = [
  { id: 'نقدی' as const, icon: Banknote },
  { id: 'کارت‌خوان' as const, icon: CreditCard },
  { id: 'درگاه آنلاین' as const, icon: Wallet },
];

export function FinanceCashier() {
  const { invoices, payInvoice, notify, user } = useApp();
  const today = todayIso();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [method, setMethod] = useState<'نقدی' | 'کارت‌خوان' | 'درگاه آنلاین'>('کارت‌خوان');

  const todayInvoices = useMemo(
    () => invoices.filter((i) => i.date === today),
    [invoices, today],
  );

  const filtered = todayInvoices
    .filter((i) => {
      if (filter === 'unpaid') return i.status !== 'تسویه‌شده';
      if (filter === 'paid') return i.status === 'تسویه‌شده';
      return true;
    })
    .filter((i) => {
      const patient = getPatient(i.patientId);
      return !query || (patient?.name.includes(query) ?? false) || i.no.includes(query);
    });

  const selected = invoices.find((i) => i.id === selectedId) ?? null;
  const unpaid = todayInvoices.filter((i) => i.status !== 'تسویه‌شده');
  const collected = sum(todayInvoices.map((i) => i.paidAmount));
  const totalToday = sum(todayInvoices.map((i) => invoiceTotal(i.items)));

  const settle = () => {
    if (!selected) return;
    payInvoice(selected.id, method);
    notify('success', 'پرداخت با موفقیت ثبت شد', `${money(selected.patientShare)} — ${method}`);
    setSelectedId(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="صندوق و پرداخت"
        description="تسویه فاکتورهای ویزیت و خدمات سرپایی، ثبت تراکنش‌های نقدی، کارت‌خوان و درگاه آنلاین."
        badge={<Badge tone="success" dot>صندوق باز — {user?.name}</Badge>}
        actions={
          <button
            type="button"
            onClick={() => notify('info', 'چاپ گزارش صندوق', 'گزارش تراکنش‌های امروز آماده چاپ شد.')}
            className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
          >
            <Printer className="size-3.5" /> چاپ گزارش
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="فاکتورهای امروز" value={num(todayInvoices.length)} icon={Receipt} tone="emerald" hint="صادرشده در صندوق" />
        <StatCard label="دریافتی امروز" value={money(collected)} icon={Wallet} tone="teal" hint="نقدی، کارت‌خوان و آنلاین" />
        <StatCard label="در انتظار پرداخت" value={num(unpaid.length)} icon={FileText} tone="amber" hint={money(sum(unpaid.map((i) => i.patientShare)))} />
        <StatCard label="مبلغ کل فاکتورها" value={money(totalToday)} icon={CreditCard} tone="sky" hint="قبل از کسر بیمه" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <CardHeader className="mb-0" title="فاکتورهای امروز" subtitle="لیست تراکنش‌ها و وضعیت تسویه" icon={Receipt} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-base-content/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی بیمار یا شماره فاکتور..."
                className="input input-sm h-9 w-52 rounded-xl border-base-300 bg-base-100 pr-8 text-xs"
              />
            </div>
            <Tabs
              items={[
                { id: 'all', label: 'همه', count: todayInvoices.length },
                { id: 'unpaid', label: 'در انتظار', count: unpaid.length },
                { id: 'paid', label: 'تسویه‌شده', count: todayInvoices.length - unpaid.length },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[10px] text-base-content/45">
                  <th className="font-medium">شماره فاکتور</th>
                  <th className="font-medium">بیمار</th>
                  <th className="font-medium">پزشک</th>
                  <th className="font-medium">مبلغ کل</th>
                  <th className="font-medium">سهم بیمار</th>
                  <th className="font-medium">پرداخت</th>
                  <th className="font-medium">روش</th>
                  <th className="font-medium">وضعیت</th>
                  <th className="font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => {
                  const patient = getPatient(invoice.patientId);
                  return (
                    <tr key={invoice.id} className="border-base-300/50 transition hover:bg-base-200/30">
                      <td className="text-[10px] font-medium" dir="ltr">{invoice.no}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={patient?.name ?? ''} size="xs" />
                          <div>
                            <p className="text-[11px] font-semibold text-base-content">{patient?.name}</p>
                            {patient ? <InsuranceChip kind={patient.insurance} /> : null}
                          </div>
                        </div>
                      </td>
                      <td className="text-[10px] text-base-content/60">{getDoctor(invoice.doctorId)?.name ?? '—'}</td>
                      <td className="text-[11px] text-base-content/70">{money(invoiceTotal(invoice.items))}</td>
                      <td className="text-[11px] font-medium">{money(invoice.patientShare)}</td>
                      <td className="text-[11px] text-success">{money(invoice.paidAmount)}</td>
                      <td>
                        <span className="text-[10px] text-base-content/55">{invoice.method ?? '—'}</span>
                      </td>
                      <td><InvoiceStatusBadge status={invoice.status} /></td>
                      <td>
                        {invoice.status !== 'تسویه‌شده' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedId(invoice.id)}
                            className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-content hover:bg-primary/90"
                          >
                            تسویه
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => notify('info', 'رسید پرداخت', `فاکتور ${invoice.no} تسویه شده است.`)}
                            className="rounded-lg border border-base-300 px-2 py-1 text-[10px] text-base-content/55 hover:bg-base-200"
                          >
                            رسید
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Receipt} title="فاکتوری یافت نشد" description="فیلتر یا عبارت جستجو را تغییر دهید." />
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {methods.map((m) => {
          const Icon = m.icon;
          const amount = sum(
            todayInvoices.filter((i) => i.method === m.id).map((i) => i.paidAmount),
          );
          return (
            <Card key={m.id} className="flex items-center gap-3 py-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-[10px] text-base-content/45">{m.id}</p>
                <p className="text-sm font-bold text-base-content">{money(amount)}</p>
              </div>
              <Badge tone="neutral" className="ms-auto">
                {faDigits(todayInvoices.filter((i) => i.method === m.id).length)} تراکنش
              </Badge>
            </Card>
          );
        })}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="تسویه فاکتور"
        description={selected ? `${selected.no} — ${getPatient(selected.patientId)?.name}` : undefined}
        footer={
          selected ? (
            <>
              <button type="button" onClick={() => setSelectedId(null)} className="btn btn-sm rounded-xl border-base-300 bg-base-100 text-xs">
                انصراف
              </button>
              <button type="button" onClick={settle} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                <CheckCircle2 className="size-3.5" /> تأیید و ثبت پرداخت
              </button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-base-200/60 p-3">
              <div className="flex items-center gap-2">
                <Avatar name={getPatient(selected.patientId)?.name ?? ''} size="sm" />
                <div>
                  <p className="text-xs font-bold text-base-content">{getPatient(selected.patientId)?.name}</p>
                  <p className="text-[10px] text-base-content/45">فاکتور {selected.no}</p>
                </div>
              </div>
              <InvoiceStatusBadge status={selected.status} />
            </div>

            <div className="space-y-1.5 rounded-xl border border-base-300/60 p-3 text-[11px]">
              {selected.items.map((item) => (
                <div key={item.title} className="flex justify-between">
                  <span className="text-base-content/55">{item.title}</span>
                  <span className="font-medium">{money(item.unit * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-dashed border-base-300 pt-1.5">
                <span className="text-base-content/55">سهم بیمه پایه</span>
                <span className="text-success">− {money(selected.insuranceShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/55">سهم بیمه تکمیلی</span>
                <span className="text-info">− {money(selected.supplementaryShare)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-primary/5 px-2 py-2 text-xs">
                <span className="font-semibold">مبلغ قابل پرداخت</span>
                <span className="font-extrabold text-primary">{money(selected.patientShare)}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-medium text-base-content/60">روش پرداخت</p>
              <div className="grid grid-cols-3 gap-2">
                {methods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[10px] transition ${
                        method === m.id
                          ? 'border-primary bg-primary/5 font-semibold text-primary'
                          : 'border-base-300 text-base-content/55 hover:bg-base-200'
                      }`}
                    >
                      <Icon className="size-4" />
                      {m.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="flex items-center gap-1.5 rounded-lg bg-base-200/50 px-3 py-2 text-[10px] text-base-content/45">
              <FileText className="size-3.5" /> پس از ثبت پرداخت، رسید برای بیمار چاپ و سند بیمه ایجاد می‌شود.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
