import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { StatusDot } from '../ui/Badge';
import { getDoctor, getPatient } from '../../data/mock';
import type {
  AppointmentStatus,
  InsuranceDoc,
  InsuranceKind,
  Invoice,
  OrderItem,
} from '../../types';
import { cx } from '../ui/utils';

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'scheduled':
      return <Badge tone="neutral" dot>نوبت‌گرفته</Badge>;
    case 'arrived':
      return <Badge tone="warning" dot>حاضر شده</Badge>;
    case 'waiting':
      return <Badge tone="warning" dot>در انتظار</Badge>;
    case 'in-progress':
      return <Badge tone="primary" dot>در حال ویزیت</Badge>;
    case 'done':
      return <Badge tone="success" dot>ویزیت شد</Badge>;
    case 'canceled':
      return <Badge tone="error" dot>لغو شده</Badge>;
    default:
      return null;
  }
}

export function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  if (status === 'تسویه‌شده') return <Badge tone="success" dot>{status}</Badge>;
  if (status === 'پرداخت جزئی') return <Badge tone="warning" dot>{status}</Badge>;
  return <Badge tone="error" dot>{status}</Badge>;
}

export function DocStatusBadge({ status }: { status: InsuranceDoc['status'] }) {
  if (status === 'پذیرفته‌شده') return <Badge tone="success" dot>{status}</Badge>;
  if (status === 'رد‌شده') return <Badge tone="error" dot>{status}</Badge>;
  if (status === 'ارسال‌شده') return <Badge tone="info" dot>{status}</Badge>;
  return <Badge tone="neutral">{status}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderItem['status'] }) {
  if (status === 'انجام شد') return <Badge tone="success" dot>{status}</Badge>;
  if (status === 'در حال انجام') return <Badge tone="primary" dot>{status}</Badge>;
  return <Badge tone="warning" dot>{status}</Badge>;
}

const insuranceTone: Record<InsuranceKind, 'success' | 'info' | 'warning' | 'secondary'> = {
  'تأمین اجتماعی': 'success',
  'بیمه سلامت': 'info',
  آزاد: 'warning',
  'نیروهای مسلح': 'secondary',
};

export function InsuranceChip({ kind, supplementary }: { kind: InsuranceKind; supplementary?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Badge tone={insuranceTone[kind]}>{kind}</Badge>
      {supplementary && supplementary !== '—' ? (
        <Badge tone="neutral">{supplementary.replace('بیمه تکمیلی ', 'تکمیلی ')}</Badge>
      ) : null}
    </div>
  );
}

export function PatientCell({
  patientId,
  secondary = 'file',
  compact = false,
}: {
  patientId: string;
  secondary?: 'file' | 'phone' | 'nationalId';
  compact?: boolean;
}) {
  const patient = getPatient(patientId);
  const sub =
    secondary === 'phone'
      ? patient?.phone
      : secondary === 'nationalId'
        ? `کد ملی ${patient?.nationalId}`
        : `پرونده ${patient?.fileNo}`;
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={patient?.name ?? 'بیمار'} size={compact ? 'xs' : 'sm'} />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-base-content">{patient?.name ?? 'بیمار'}</p>
        <p className="truncate text-[10px] text-base-content/45">{sub}</p>
      </div>
    </div>
  );
}

export function DoctorCell({ doctorId, withRoom = true }: { doctorId: string; withRoom?: boolean }) {
  const doctor = getDoctor(doctorId);
  if (!doctor) return <span className="text-xs text-base-content/50">—</span>;
  return (
    <div className="flex items-center gap-2">
      <Avatar name={doctor.name} size="xs" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-base-content">{doctor.name}</p>
        {withRoom ? <p className="text-[10px] text-base-content/45">{doctor.room}</p> : null}
      </div>
    </div>
  );
}

export function QueueBadge({ number, active = false }: { number: number; active?: boolean }) {
  return (
    <span
      className={cx(
        'inline-grid size-9 place-items-center rounded-xl text-sm font-extrabold tabular-nums',
        active
          ? 'bg-primary text-primary-content shadow-sm'
          : 'bg-base-200 text-base-content/70',
      )}
    >
      {number.toLocaleString('fa-IR')}
    </span>
  );
}

export function LiveTag({ label = 'زنده' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
      <StatusDot tone="success" pulse />
      {label}
    </span>
  );
}
