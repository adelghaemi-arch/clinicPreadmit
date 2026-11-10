import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock3,
  Play,
  ScanLine,
  Syringe,
  Thermometer,
  TimerReset,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { useApp } from '../../store/AppStore';
import { getDoctor, getPatient } from '../../data/mock';
import { faDigits, num, todayIso } from '../../lib/utils';
import { OrderStatusBadge } from '../../components/clinic/ClinicBits';
import type { OrderItem } from '../../types';

const types = ['همه', 'تزریقات', 'پانسمان', 'سرم‌تراپی', 'نوار قلب', 'نمونه‌گیری'] as const;

const typeStyles: Record<string, { icon: typeof Syringe; tone: string; bg: string }> = {
  تزریقات: { icon: Syringe, tone: 'text-rose-500', bg: 'bg-rose-500/10' },
  پانسمان: { icon: Thermometer, tone: 'text-amber-500', bg: 'bg-amber-500/10' },
  'سرم‌تراپی': { icon: Activity, tone: 'text-sky-500', bg: 'bg-sky-500/10' },
  'نوار قلب': { icon: ScanLine, tone: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  'نمونه‌گیری': { icon: TimerReset, tone: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

const columns = [
  { id: 'در انتظار', label: 'در انتظار انجام', tone: 'warning' as const, icon: Clock3 },
  { id: 'در حال انجام', label: 'در حال انجام', tone: 'primary' as const, icon: Activity },
  { id: 'انجام شد', label: 'انجام‌شده', tone: 'success' as const, icon: CheckCircle2 },
];

export function NursingServices() {
  const { orders, updateOrder, notify } = useApp();
  const [type, setType] = useState<string>('همه');
  const [selected, setSelected] = useState<OrderItem | null>(null);
  const today = todayIso();

  const filtered = useMemo(
    () => orders.filter((o) => type === 'همه' || o.type === type),
    [orders, type],
  );

  const todayOrders = orders.filter((o) => o.date === today);
  const pending = todayOrders.filter((o) => o.status === 'در انتظار').length;
  const doing = todayOrders.filter((o) => o.status === 'در حال انجام').length;
  const done = todayOrders.filter((o) => o.status === 'انجام شد').length;

  const advance = (order: OrderItem) => {
    if (order.status === 'در انتظار') {
      updateOrder(order.id, { status: 'در حال انجام' });
      notify('info', 'شروع خدمت ثبت شد', order.title);
    } else if (order.status === 'در حال انجام') {
      updateOrder(order.id, { status: 'انجام شد' });
      notify('success', 'خدمت با موفقیت ثبت شد', `${order.title} — ${getPatient(order.patientId)?.name}`);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="تزریقات و پانسمان"
        description="مدیریت دستورات پاراکلینیک سرپایی، تزریقات، سرم‌تراپی، پانسمان و نمونه‌گیری."
        badge={<Badge tone="warning" dot>{faDigits(pending)} خدمت در انتظار</Badge>}
        actions={
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input input-sm h-9 w-40 rounded-xl border-base-300 bg-base-100 text-xs clinic-select"
          >
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="خدمات امروز" value={num(todayOrders.length)} icon={Syringe} tone="rose" hint="دستورات ثبت‌شده" />
        <StatCard label="در انتظار انجام" value={num(pending)} icon={Clock3} tone="amber" hint="اولویت رسیدگی" />
        <StatCard label="در حال انجام" value={num(doing)} icon={Activity} tone="sky" hint="اتاق تزریقات" />
        <StatCard label="انجام‌شده" value={num(done)} icon={CheckCircle2} tone="emerald" hint="ثبت‌شده در پرونده" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const ColumnIcon = column.icon;
          const items = filtered.filter((o) => o.status === column.id);
          return (
            <Card key={column.id} className="flex flex-col bg-base-100/60">
              <CardHeader
                title={column.label}
                icon={ColumnIcon}
                action={<Badge tone={column.tone}>{faDigits(items.length)}</Badge>}
                className="mb-3"
              />
              <div className="flex-1 space-y-2">
                {items.length ? (
                  items.map((order) => {
                    const style = typeStyles[order.type] ?? typeStyles['تزریقات']!;
                    const Icon = style.icon;
                    const patient = getPatient(order.patientId);
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelected(order)}
                        className="w-full rounded-xl border border-base-300/70 bg-base-100 p-2.5 text-right transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex items-start gap-2">
                          <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${style.bg} ${style.tone}`}>
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-base-content">{order.title}</p>
                            <p className="mt-0.5 text-[9px] text-base-content/40">{order.type} · {order.room}</p>
                          </div>
                          <span className="text-[9px] text-base-content/35">{faDigits(order.time)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-base-300/50 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={patient?.name ?? ''} size="xs" />
                            <span className="text-[10px] text-base-content/55">{patient?.name}</span>
                          </div>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="rounded-lg border border-dashed border-base-300 py-6 text-center text-[10px] text-base-content/35">
                    موردی در این وضعیت نیست
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader title="راهنمای ایمنی بیمار" subtitle="پروتکل اجرای خدمات سرپایی" icon={CheckCircle2} />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['هویت بیمار', 'مطابقت نام و شماره پرونده پیش از تزریق'],
            ['آلرژی', 'بررسی حساسیت دارویی در پرونده الکترونیک'],
            ['استریل', 'استفاده از تجهیزات یک‌بار مصرف'],
            ['ثبت خدمت', 'ثبت زمان و مجری در پرونده پس از انجام'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl bg-base-200/50 p-2.5">
              <p className="text-[10px] font-semibold text-base-content/75">{title}</p>
              <p className="mt-0.5 text-[9px] leading-5 text-base-content/45">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        description={selected ? `${selected.type} — ${selected.room}` : undefined}
        footer={
          selected ? (
            <>
              <button type="button" onClick={() => setSelected(null)} className="btn btn-sm rounded-xl border-base-300 bg-base-100 text-xs">
                بستن
              </button>
              {selected.status !== 'انجام شد' ? (
                <button type="button" onClick={() => advance(selected)} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                  {selected.status === 'در انتظار' ? <Play className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                  {selected.status === 'در انتظار' ? 'شروع خدمت' : 'ثبت انجام خدمت'}
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-success"><CheckCircle2 className="size-4" /> انجام شده</span>
              )}
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-base-200/60 p-3">
              <Avatar name={getPatient(selected.patientId)?.name ?? ''} size="md" />
              <div className="flex-1">
                <p className="text-xs font-bold text-base-content">{getPatient(selected.patientId)?.name}</p>
                <p className="text-[10px] text-base-content/45">
                  {faDigits(getPatient(selected.patientId)?.age ?? 0)} ساله · پرونده {getPatient(selected.patientId)?.fileNo}
                </p>
              </div>
              <OrderStatusBadge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['نوع خدمت', selected.type],
                ['اتاق', selected.room],
                ['ساعت', faDigits(selected.time)],
                ['پزشک دستوردهنده', getDoctor(selected.doctorId)?.name ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-base-300/60 px-2.5 py-1.5">
                  <p className="text-[9px] text-base-content/40">{label}</p>
                  <p className="mt-0.5 font-medium text-base-content">{value}</p>
                </div>
              ))}
            </div>
            {selected.note ? (
              <p className="rounded-lg bg-warning/10 px-3 py-2 text-[10px] leading-5 text-warning">
                یادداشت پزشک: {selected.note}
              </p>
            ) : null}
            <p className="flex items-center gap-1.5 rounded-lg bg-base-200/50 px-3 py-2 text-[10px] text-base-content/45">
              <UserRound className="size-3.5" /> اجرا توسط پرستار شیفت سرپایی — ثبت خودکار در پرونده بیمار
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
