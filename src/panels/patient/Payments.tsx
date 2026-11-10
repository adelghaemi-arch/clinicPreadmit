import { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Printer,
  Receipt,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { CLINIC, getDoctor, getPatient } from '../../data/mock';
import { faDigits, faNumericDate, faShortDate, invoiceTotal, money, num, sum, todayIso } from '../../lib/utils';
import { InvoiceStatusBadge } from '../../components/clinic/ClinicBits';

export function PatientPayments() {
  const { user, patients, invoices, payInvoice, notify } = useApp();
  const patientId = user?.patientId ?? patients[0]?.id ?? 'p1';
  const patient = getPatient(patientId);
  const myInvoices = invoices
    .filter((i) => i.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = invoices.find((i) => i.id === selectedId) ?? null;

  const paidTotal = sum(myInvoices.map((i) => i.paidAmount));
  const unpaid = myInvoices.filter((i) => i.status !== 'تسویه‌شده');
  const unpaidTotal = sum(unpaid.map((i) => i.patientShare));
  const supplementary = sum(myInvoices.map((i) => i.supplementaryShare));

  const pay = () => {
    if (!selected) return;
    payInvoice(selected.id, 'درگاه آنلاین');
    notify('success', 'پرداخت با موفقیت انجام شد', `${money(selected.patientShare)} — فاکتور ${selected.no}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="پرداخت‌ها و فاکتورها"
        description="مشاهده رسیدهای پرداخت، فاکتورهای صادرشده و دریافت مدارک برای بیمه تکمیلی."
        badge={<Badge tone="success" dot>پرداخت امن شتاب</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="کل پرداختی" value={money(paidTotal)} icon={Wallet} tone="emerald" hint={`${faDigits(myInvoices.filter((i) => i.status === 'تسویه‌شده').length)} فاکتور تسویه‌شده`} />
        <StatCard label="در انتظار پرداخت" value={money(unpaidTotal)} icon={CreditCard} tone="amber" hint={`${faDigits(unpaid.length)} فاکتور`} />
        <StatCard label="تعداد فاکتورها" value={num(myInvoices.length)} icon={Receipt} tone="teal" hint="از ابتدای پرونده" />
        <StatCard label="سهم بیمه تکمیلی" value={money(supplementary)} icon={ShieldCheck} tone="sky" hint="قابل پیگیری از بیمه" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="فاکتورهای من"
            subtitle={`${patient?.name} — پرونده ${patient?.fileNo}`}
            icon={Receipt}
            action={<Badge tone={unpaid.length ? 'warning' : 'success'}>{unpaid.length ? `${faDigits(unpaid.length)} در انتظار` : 'همه تسویه‌شده'}</Badge>}
          />
          {myInvoices.length ? (
            <div className="space-y-2">
              {myInvoices.map((invoice) => {
                const total = invoiceTotal(invoice.items);
                return (
                  <div key={invoice.id} className="rounded-xl border border-base-300/60 p-2.5 transition hover:bg-base-200/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="size-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold text-base-content" dir="ltr">{invoice.no}</p>
                          <p className="text-[9px] text-base-content/40">
                            {faShortDate(invoice.date)} · {getDoctor(invoice.doctorId)?.name ?? 'خدمات کلینیک'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <InvoiceStatusBadge status={invoice.status} />
                        <span className="text-xs font-bold text-base-content">{money(total)}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-base-300/50 pt-2">
                      <div className="flex flex-wrap gap-2 text-[9px] text-base-content/45">
                        <span>سهم بیمه: {money(invoice.insuranceShare)}</span>
                        <span>سهم شما: <span className="font-semibold text-base-content/70">{money(invoice.patientShare)}</span></span>
                        {invoice.method ? <span>روش: {invoice.method}</span> : null}
                      </div>
                      {invoice.status !== 'تسویه‌شده' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedId(invoice.id)}
                          className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-content hover:bg-primary/90"
                        >
                          پرداخت آنلاین
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedId(invoice.id)}
                          className="rounded-lg border border-base-300 px-2.5 py-1 text-[10px] text-base-content/55 hover:bg-base-200"
                        >
                          مشاهده رسید
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Receipt} title="فاکتوری ثبت نشده است" description="پس از رزرو نوبت یا دریافت خدمت، فاکتور در این بخش نمایش داده می‌شود." />
          )}
        </Card>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader title="بیمه تکمیلی" subtitle="مدارک قابل ارائه" icon={ShieldCheck} />
            <p className="text-[10px] leading-6 text-base-content/55">
              برای دریافت هزینه از بیمه تکمیلی، فاکتورها و رسیدهای پرداخت را از این بخش دانلود کنید.
              سهم بیمه تکمیلی شما در فاکتورها به‌صورت خودکار محاسبه شده است.
            </p>
            <div className="mt-3 rounded-xl bg-base-100/70 p-2.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-base-content/45">بیمه پایه</span>
                <span className="font-medium">{patient?.insurance}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-base-content/45">بیمه تکمیلی</span>
                <span className="font-medium">{patient?.supplementary}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => notify('success', 'درخواست مدارک ثبت شد', 'فایل PDF فاکتورها برای بیمه تکمیلی آماده دانلود است.')}
              className="btn btn-sm mt-3 w-full gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
            >
              <Download className="size-3.5" /> دریافت مدارک بیمه
            </button>
          </Card>

          <Card>
            <CardHeader title="راهنمای پرداخت" subtitle="سوالات متداول" icon={Receipt} />
            <div className="space-y-2 text-[10px] leading-6 text-base-content/55">
              <p className="rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="font-semibold text-base-content/75">لغو نوبت: </span>
                تا ۲۴ ساعت قبل از ویزیت، وجه پرداختی به‌صورت کامل بازگشت داده می‌شود.
              </p>
              <p className="rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="font-semibold text-base-content/75">رسید پرداخت: </span>
                پس از پرداخت موفق، رسید در همین صفحه قابل چاپ و دانلود است.
              </p>
              <p className="rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="font-semibold text-base-content/75">پشتیبانی: </span>
                در صورت مغایرت مالی با شماره {CLINIC.phone} تماس بگیرید.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.status === 'تسویه‌شده' ? 'رسید پرداخت' : 'پرداخت آنلاین فاکتور'}
        description={selected ? `فاکتور ${selected.no}` : undefined}
        footer={
          selected ? (
            selected.status === 'تسویه‌شده' ? (
              <>
                <button
                  type="button"
                  onClick={() => notify('info', 'دانلود رسید', 'رسید پرداخت به‌صورت PDF آماده شد.')}
                  className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
                >
                  <Download className="size-3.5" /> دانلود PDF
                </button>
                <button
                  type="button"
                  onClick={() => notify('info', 'ارسال به چاپگر', 'رسید پرداخت برای چاپ ارسال شد.')}
                  className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
                >
                  <Printer className="size-3.5" /> چاپ رسید
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setSelectedId(null)} className="btn btn-sm rounded-xl border-base-300 bg-base-100 text-xs">
                  انصراف
                </button>
                <button type="button" onClick={pay} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                  <CreditCard className="size-3.5" /> پرداخت {money(selected.patientShare)}
                </button>
              </>
            )
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-base-200/60 p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-content">م</span>
                <div>
                  <p className="text-[11px] font-bold text-base-content">{CLINIC.name}</p>
                  <p className="text-[9px] text-base-content/45">{CLINIC.hospital}</p>
                </div>
              </div>
              <InvoiceStatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                ['شماره فاکتور', selected.no],
                ['تاریخ صدور', faNumericDate(selected.date)],
                ['بیمار', patient?.name ?? '—'],
                ['پزشک', getDoctor(selected.doctorId)?.name ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-base-300/60 px-2.5 py-1.5">
                  <p className="text-[9px] text-base-content/40">{label}</p>
                  <p className="mt-0.5 font-medium text-base-content">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-base-300/60">
              <table className="table table-xs">
                <thead>
                  <tr className="bg-base-200/60 text-[9px] text-base-content/45">
                    <th className="font-medium">شرح خدمت</th>
                    <th className="font-medium">تعداد</th>
                    <th className="font-medium">مبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item) => (
                    <tr key={item.title} className="border-base-300/50">
                      <td className="text-[10px]">{item.title}</td>
                      <td className="text-[10px]">{faDigits(item.qty)}</td>
                      <td className="text-[10px]">{money(item.unit * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between px-1">
                <span className="text-base-content/50">جمع کل</span>
                <span className="font-medium">{money(invoiceTotal(selected.items))}</span>
              </div>
              <div className="flex justify-between px-1">
                <span className="text-base-content/50">سهم بیمه پایه</span>
                <span className="text-success">− {money(selected.insuranceShare)}</span>
              </div>
              <div className="flex justify-between px-1">
                <span className="text-base-content/50">سهم بیمه تکمیلی</span>
                <span className="text-info">− {money(selected.supplementaryShare)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-primary/5 px-2 py-2">
                <span className="font-semibold">سهم بیمار</span>
                <span className="font-extrabold text-primary">{money(selected.patientShare)}</span>
              </div>
            </div>

            {selected.status === 'تسویه‌شده' ? (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2">
                <CheckCircle2 className="size-5 text-success" />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-base-content">پرداخت تأیید شد</p>
                  <p className="text-[9px] text-base-content/45">
                    {selected.method} · {faShortDate(selected.date)} · صندوقدار {selected.cashier ?? '—'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 rounded-lg bg-info/5 px-3 py-2 text-[10px] text-info">
                <ShieldCheck className="size-3.5" /> پرداخت از طریق درگاه امن شتاب انجام می‌شود.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-base-300/60 pt-2 text-[9px] text-base-content/35">
              <span>{CLINIC.address}</span>
              <span>{CLINIC.phone}</span>
            </div>
            <p className="text-center text-[8px] text-base-content/30">
              امروز {faShortDate(todayIso())} — این رسید به‌عنوان سند پرداخت معتبر است.
            </p>
          </div>
        ) : null}
      </Modal>

      <p className="flex items-center justify-center gap-1 text-[9px] text-base-content/30">
        <Avatar name={patient?.name ?? ''} size="xs" /> کلیه تراکنش‌ها با شماره پرونده {patient?.fileNo} ثبت شده است.
      </p>
    </div>
  );
}
