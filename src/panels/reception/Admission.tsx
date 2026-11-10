import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Printer,
  Search,
  ShieldCheck,
  UserCheck,
  Wallet,
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
import { buildVisitInvoice, splitFee } from '../../lib/billing';
import { faDigits, money, num, sum, todayIso } from '../../lib/utils';
import {
  AppointmentStatusBadge,
  InsuranceChip,
  InvoiceStatusBadge,
} from '../../components/clinic/ClinicBits';
import type { Invoice } from '../../types';

export function ReceptionAdmission() {
  const {
    appointments,
    invoices,
    updateAppointment,
    addInvoice,
    payInvoice,
    notify,
    user,
  } = useApp();
  const today = todayIso();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);

  const todayList = useMemo(
    () =>
      appointments
        .filter((a) => a.date === today)
        .filter((a) => {
          if (filter === 'scheduled') return a.status === 'scheduled';
          if (filter === 'arrived') return ['arrived', 'waiting', 'in-progress'].includes(a.status);
          if (filter === 'done') return a.status === 'done';
          return true;
        })
        .filter((a) => {
          const patient = getPatient(a.patientId);
          return !query || (patient?.name.includes(query) ?? false) || (patient?.nationalId.includes(query) ?? false);
        })
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, filter, query, today],
  );

  const activeInvoice = invoices.find((i) => i.id === invoiceId) ?? null;
  const invoiceFor = (patientId: string, doctorId: string): Invoice | undefined =>
    invoices.find((i) => i.patientId === patientId && i.doctorId === doctorId && i.date === today);

  const arrivedCount = appointments.filter(
    (a) => a.date === today && ['arrived', 'waiting', 'in-progress'].includes(a.status),
  ).length;
  const unpaidCount = invoicesForToday(invoices, today).filter((i) => i.status !== 'تسویه‌شده').length;
  const collected = sum(
    invoices.filter((i) => i.date === today).map((i) => i.paidAmount),
  );

  const admit = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;
    const patient = getPatient(appointment.patientId);
    const doctor = getDoctor(appointment.doctorId);
    if (!patient || !doctor) return;
    if (!invoiceFor(patient.id, doctor.id)) {
      addInvoice(buildVisitInvoice(doctor, patient, today));
    }
    updateAppointment(appointment.id, { status: 'arrived' });
    setVerified((list) => (list.includes(appointment.id) ? list : [...list, appointment.id]));
    notify('success', 'بیمار پذیرش شد', `${patient.name} — قبض فرانشیز برای صندوق صادر شد.`);
  };

  const sendToQueue = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'waiting' });
    const appointment = appointments.find((a) => a.id === appointmentId);
    notify('info', 'بیمار به صف انتظار اضافه شد', `شماره صف ${faDigits(appointment?.queueNo ?? 0)}`);
  };

  const verify = (appointmentId: string) => {
    setVerified((list) => (list.includes(appointmentId) ? list : [...list, appointmentId]));
    notify('success', 'استعلام بیمه انجام شد', 'دفترچه بیمه معتبر و سهم فرانشیز محاسبه شد.');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="پذیرش روز و صندوق"
        description="فعال‌سازی نوبت بیمار، استعلام اعتبار بیمه، صدور قبض فرانشیز و ارجاع به صف انتظار."
        badge={<Badge tone="success" dot>صندوق باز</Badge>}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-1.5 text-[11px] text-base-content/60">
            <CreditCard className="size-3.5 text-primary" /> صندوقدار: {user?.name}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="نوبت‌های امروز" value={num(appointments.filter((a) => a.date === today).length)} icon={ClipboardCheck} tone="sky" hint="در تمام تخصص‌ها" />
        <StatCard label="پذیرش‌شده" value={num(arrivedCount)} icon={UserCheck} tone="teal" hint="حاضر در سالن انتظار" />
        <StatCard label="فاکتور در انتظار پرداخت" value={num(unpaidCount)} icon={FileText} tone="amber" hint="نیازمند تسویه در صندوق" />
        <StatCard label="دریافتی امروز" value={money(collected)} icon={Wallet} tone="emerald" hint="نقدی، کارت‌خوان و درگاه" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <CardHeader className="mb-0" title="لیست پذیرش امروز" subtitle="به ترتیب ساعت نوبت" icon={ClipboardCheck} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-base-content/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی بیمار..."
                className="input input-sm h-9 w-44 rounded-xl border-base-300 bg-base-100 pr-8 text-xs"
              />
            </div>
            <Tabs
              items={[
                { id: 'all', label: 'همه' },
                { id: 'scheduled', label: 'نوبت‌گرفته' },
                { id: 'arrived', label: 'حاضر' },
                { id: 'done', label: 'ویزیت‌شده' },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
        </div>

        {todayList.length ? (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[10px] text-base-content/45">
                  <th className="font-medium">ساعت</th>
                  <th className="font-medium">بیمار</th>
                  <th className="font-medium">پزشک</th>
                  <th className="font-medium">بیمه</th>
                  <th className="font-medium">فاکتور</th>
                  <th className="font-medium">وضعیت</th>
                  <th className="font-medium">عملیات پذیرش</th>
                </tr>
              </thead>
              <tbody>
                {todayList.map((appointment) => {
                  const patient = getPatient(appointment.patientId);
                  const doctor = getDoctor(appointment.doctorId);
                  const invoice = invoiceFor(appointment.patientId, appointment.doctorId);
                  const isVerified = verified.includes(appointment.id);
                  return (
                    <tr key={appointment.id} className="border-base-300/50 transition hover:bg-base-200/30">
                      <td className="text-[11px] font-medium tabular-nums" dir="ltr">{faDigits(appointment.time)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={patient?.name ?? ''} size="xs" />
                          <div>
                            <p className="text-[11px] font-semibold text-base-content">{patient?.name}</p>
                            <p className="text-[9px] text-base-content/40">
                              صف {faDigits(appointment.queueNo)} · {patient?.fileNo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-[10px] text-base-content/65">{doctor?.name}</td>
                      <td>
                        {patient ? <InsuranceChip kind={patient.insurance} /> : null}
                        {isVerified ? (
                          <span className="mt-1 flex items-center gap-0.5 text-[9px] text-success">
                            <ShieldCheck className="size-2.5" /> استعلام تأیید شد
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {invoice ? (
                          <div className="flex flex-col gap-1">
                            <InvoiceStatusBadge status={invoice.status} />
                            <button
                              type="button"
                              onClick={() => setInvoiceId(invoice.id)}
                              className="text-[9px] font-medium text-primary hover:underline"
                            >
                              مشاهده قبض
                            </button>
                          </div>
                        ) : (
                          <Badge tone="neutral">صادر نشده</Badge>
                        )}
                      </td>
                      <td><AppointmentStatusBadge status={appointment.status} /></td>
                      <td>
                        <div className="flex flex-wrap items-center gap-1">
                          {appointment.status === 'scheduled' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => verify(appointment.id)}
                                className="rounded-lg border border-base-300 px-2 py-1 text-[10px] text-base-content/60 hover:bg-base-200"
                              >
                                استعلام بیمه
                              </button>
                              <button
                                type="button"
                                onClick={() => admit(appointment.id)}
                                className="rounded-lg bg-primary px-2 py-1 text-[10px] font-medium text-primary-content hover:bg-primary/90"
                              >
                                پذیرش بیمار
                              </button>
                            </>
                          ) : null}
                          {appointment.status === 'arrived' ? (
                            <button
                              type="button"
                              onClick={() => sendToQueue(appointment.id)}
                              className="rounded-lg bg-warning/15 px-2 py-1 text-[10px] font-medium text-warning hover:bg-warning/25"
                            >
                              ارسال به صف
                            </button>
                          ) : null}
                          {['waiting', 'in-progress'].includes(appointment.status) ? (
                            <span className="text-[9px] text-base-content/35">در صف انتظار</span>
                          ) : null}
                          {appointment.status === 'done' ? (
                            <span className="flex items-center gap-1 text-[9px] text-success">
                              <CheckCircle2 className="size-3" /> تکمیل‌شده
                            </span>
                          ) : null}
                          {appointment.status === 'canceled' ? (
                            <span className="text-[9px] text-error">لغو شده</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ClipboardCheck} title="موردی برای پذیرش یافت نشد" description="فیلتر یا عبارت جستجو را تغییر دهید." />
        )}
      </Card>

      <Modal
        open={Boolean(activeInvoice)}
        onClose={() => setInvoiceId(null)}
        title={`قبض صندوق — ${activeInvoice?.no ?? ''}`}
        description={activeInvoice ? getPatient(activeInvoice.patientId)?.name : undefined}
        size="lg"
        footer={
          activeInvoice ? (
            <>
              <button
                type="button"
                onClick={() => notify('info', 'ارسال به چاپگر', 'قبض برای چاپ به صندوق ارسال شد.')}
                className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
              >
                <Printer className="size-3.5" /> چاپ قبض
              </button>
              {activeInvoice.status !== 'تسویه‌شده' ? (
                <button
                  type="button"
                  onClick={() => {
                    payInvoice(activeInvoice.id, 'کارت‌خوان');
                    notify('success', 'پرداخت ثبت شد', `${money(activeInvoice.patientShare)} از طریق کارت‌خوان دریافت شد.`);
                  }}
                  className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
                >
                  <CreditCard className="size-3.5" /> ثبت پرداخت کارت‌خوان
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-success">
                  <CheckCircle2 className="size-4" /> این فاکتور تسویه شده است
                </span>
              )}
            </>
          ) : null
        }
      >
        {activeInvoice ? (
          <InvoiceBody invoice={activeInvoice} />
        ) : null}
      </Modal>
    </div>
  );
}

function invoicesForToday(invoices: Invoice[], today: string): Invoice[] {
  return invoices.filter((i) => i.date === today);
}

function InvoiceBody({ invoice, onPay }: { invoice: Invoice; onPay?: (method: 'نقدی' | 'کارت‌خوان' | 'درگاه آنلاین') => void }) {
  const patient = getPatient(invoice.patientId);
  const total = sum(invoice.items.map((i) => i.unit * i.qty));
  const split = patient ? splitFee(total, patient) : null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-base-200/60 p-3">
        <div className="flex items-center gap-2">
          <Avatar name={getPatient(invoice.patientId)?.name ?? ''} size="sm" />
          <div>
            <p className="text-xs font-bold text-base-content">{getPatient(invoice.patientId)?.name}</p>
            <p className="text-[10px] text-base-content/45">
              پرونده {getPatient(invoice.patientId)?.fileNo} · {faDigits(getPatient(invoice.patientId)?.phone ?? '')}
            </p>
          </div>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="overflow-hidden rounded-xl border border-base-300/60">
        <table className="table table-xs">
          <thead>
            <tr className="bg-base-200/60 text-[10px] text-base-content/50">
              <th className="font-medium">شرح خدمت</th>
              <th className="font-medium">تعداد</th>
              <th className="font-medium">مبلغ واحد</th>
              <th className="font-medium">جمع</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.title} className="border-base-300/50">
                <td className="text-[11px]">{item.title}</td>
                <td className="text-[11px]">{faDigits(item.qty)}</td>
                <td className="text-[11px]">{money(item.unit)}</td>
                <td className="text-[11px] font-medium">{money(item.unit * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-1.5 text-[11px]">
        <div className="flex justify-between px-1">
          <span className="text-base-content/50">جمع کل</span>
          <span className="font-medium">{money(total)}</span>
        </div>
        <div className="flex justify-between px-1">
          <span className="text-base-content/50">سهم بیمه پایه</span>
          <span className="text-success">− {money(invoice.insuranceShare)}</span>
        </div>
        <div className="flex justify-between px-1">
          <span className="text-base-content/50">سهم بیمه تکمیلی</span>
          <span className="text-info">− {money(invoice.supplementaryShare)}</span>
        </div>
        <div className="mt-1 flex justify-between rounded-lg bg-primary/5 px-2 py-2">
          <span className="font-semibold text-base-content">سهم بیمار (فرانشیز)</span>
          <span className="font-extrabold text-primary">{money(invoice.patientShare)}</span>
        </div>
        <div className="flex justify-between px-1">
          <span className="text-base-content/50">پرداخت‌شده</span>
          <span className="font-medium">{money(invoice.paidAmount)}</span>
        </div>
      </div>

      {split ? (
        <p className="text-[9px] leading-5 text-base-content/35">
          محاسبه بر اساس پوشش {patient?.insurance}
          {patient?.supplementary !== '—' ? ` و ${patient?.supplementary}` : ''} — مبالغ به تومان است.
        </p>
      ) : null}

      {onPay && invoice.status !== 'تسویه‌شده' ? (
        <div className="flex flex-wrap gap-2">
          {([
            ['نقدی', Banknote],
            ['کارت‌خوان', CreditCard],
            ['درگاه آنلاین', Wallet],
          ] as const).map(([method, Icon]) => (
            <button
              key={method}
              type="button"
              onClick={() => onPay(method)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-base-300 px-2 py-2 text-[10px] font-medium text-base-content/65 hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-3.5" /> {method}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
