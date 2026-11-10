import { useState } from 'react';
import {
  CheckCircle2,
  FlaskConical,
  Pill,
  Printer,
  ScanLine,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useApp } from '../../store/AppStore';
import { CLINIC, getDoctor, getPatient } from '../../data/mock';
import { faDigits, faShortDate, num, sum } from '../../lib/utils';
import type { Prescription } from '../../types';

export function PatientPrescriptions() {
  const { user, patients, prescriptions, notify } = useApp();
  const patientId = user?.patientId ?? patients[0]?.id ?? 'p1';
  const patient = getPatient(patientId);
  const myRx = prescriptions.filter((p) => p.patientId === patientId);
  const [selected, setSelected] = useState<Prescription | null>(null);

  const totalItems = sum(myRx.map((rx) => rx.items.length));

  return (
    <div className="space-y-5">
      <PageHeader
        title="نسخ الکترونیک من"
        description="مشاهده نسخ دارویی، درخواست آزمایش و تصویربرداری با کد رهگیری قابل ارائه به بیمه."
        badge={<Badge tone="success" dot>متصل به سامانه بیمه</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="نسخ صادرشده" value={num(myRx.length)} icon={Pill} tone="fuchsia" hint="از ابتدای پرونده" />
        <StatCard label="اقلام دارویی" value={num(totalItems)} icon={ShieldCheck} tone="teal" hint="در همه نسخ" />
        <StatCard label="درخواست آزمایش" value={num(sum(myRx.map((r) => r.labs.length)))} icon={FlaskConical} tone="sky" hint="ثبت‌شده برای بیمه" />
        <StatCard label="درخواست تصویربرداری" value={num(sum(myRx.map((r) => r.imaging.length)))} icon={ScanLine} tone="indigo" hint="پاراکلینیک" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {myRx.length ? (
          myRx.map((rx) => {
            const doctor = getDoctor(rx.doctorId);
            return (
              <Card key={rx.id} className="relative overflow-hidden">
                <div className="pointer-events-none absolute -left-6 -top-8 size-24 rounded-full bg-primary/5 blur-xl" />
                <div className="relative flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Pill className="size-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-base-content">{rx.diagnosis}</p>
                      <p className="mt-0.5 text-[9px] text-base-content/40">{faShortDate(rx.date)} · {doctor?.name}</p>
                    </div>
                  </div>
                  <Badge tone="success" dot>صادرشده</Badge>
                </div>

                <div className="relative mt-2 rounded-lg border border-dashed border-base-300 bg-base-200/40 px-2.5 py-1.5 text-center">
                  <p className="text-[8px] text-base-content/40">کد رهگیری بیمه</p>
                  <p className="font-mono text-[11px] font-bold tracking-wider text-primary" dir="ltr">{rx.code}</p>
                </div>

                <div className="relative mt-2 space-y-1">
                  {rx.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg bg-base-200/40 px-2 py-1 text-[10px]">
                      <span className="font-medium text-base-content/70">{item.name}</span>
                      <span className="text-base-content/40">{item.dose} · {item.duration}</span>
                    </div>
                  ))}
                </div>

                <div className="relative mt-2 flex flex-wrap gap-1">
                  {rx.labs.map((lab) => <Badge key={lab} tone="info">{lab}</Badge>)}
                  {rx.imaging.map((img) => <Badge key={img} tone="secondary">{img}</Badge>)}
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(rx)}
                  className="relative mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-base-300 py-1.5 text-[10px] font-medium text-base-content/60 transition hover:bg-base-200"
                >
                  <Printer className="size-3" /> مشاهده و چاپ نسخه
                </button>
              </Card>
            );
          })
        ) : (
          <div className="lg:col-span-2">
            <EmptyState icon={Pill} title="نسخه‌ای صادر نشده است" description="پس از ویزیت پزشک، نسخ الکترونیک در این بخش قابل مشاهده است." />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="نسخه الکترونیک"
        description={selected ? `کد رهگیری ${selected.code}` : undefined}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => notify('info', 'ارسال به چاپگر', 'نسخه برای چاپ ارسال شد.')}
              className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
            >
              <Printer className="size-3.5" /> چاپ نسخه
            </button>
            <button type="button" onClick={() => setSelected(null)} className="btn btn-sm btn-primary rounded-xl text-xs">
              بستن
            </button>
          </>
        }
      >
        {selected ? (
          <div className="rounded-xl border border-base-300 p-4">
            <div className="flex items-start justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-content">م</span>
                <div>
                  <p className="text-xs font-extrabold text-base-content">{CLINIC.name}</p>
                  <p className="text-[9px] text-base-content/45">{CLINIC.hospital}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-[8px] text-base-content/40">نسخه الکترونیک</p>
                <p className="font-mono text-[9px] font-bold text-primary" dir="ltr">{selected.code}</p>
                <p className="text-[8px] text-base-content/40">{faShortDate(selected.date)}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Avatar name={patient?.name ?? ''} size="md" />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-base-content">{patient?.name}</p>
                <p className="text-[9px] text-base-content/45">
                  {faDigits(patient?.age ?? 0)} ساله · کد ملی {faDigits(patient?.nationalId ?? '')} · {selected.insurance}
                </p>
              </div>
              <Badge tone="success" dot>بیمه تأیید شد</Badge>
            </div>

            <div className="mt-3 rounded-lg bg-base-200/50 px-2.5 py-1.5 text-[10px]">
              <span className="text-base-content/45">تشخیص: </span>
              <span className="font-medium text-base-content/75">{selected.diagnosis}</span>
            </div>

            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold text-base-content/60">
                <Stethoscope className="size-3.5" /> اقلام دارویی
              </p>
              <table className="table table-xs">
                <thead>
                  <tr className="text-[9px] text-base-content/40">
                    <th className="font-medium">دارو</th>
                    <th className="font-medium">دوز</th>
                    <th className="font-medium">مدت</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item) => (
                    <tr key={item.name} className="border-base-300/50">
                      <td className="text-[10px]">{item.name}</td>
                      <td className="text-[10px]">{item.dose}</td>
                      <td className="text-[10px]">{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected.labs.length || selected.imaging.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {selected.labs.map((lab) => <Badge key={lab} tone="info">آزمایش: {lab}</Badge>)}
                {selected.imaging.map((img) => <Badge key={img} tone="secondary">تصویربرداری: {img}</Badge>)}
              </div>
            ) : null}

            {selected.note ? (
              <p className="mt-2 text-[9px] leading-5 text-base-content/50">توصیه پزشک: {selected.note}</p>
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-dashed border-base-300 pt-2">
              <div className="flex items-center gap-1.5">
                <Avatar name={getDoctor(selected.doctorId)?.name ?? ''} size="xs" />
                <div>
                  <p className="text-[9px] font-semibold text-base-content/70">{getDoctor(selected.doctorId)?.name}</p>
                  <p className="text-[8px] text-base-content/40">مهر و امضای الکترونیک پزشک</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[8px] text-success">
                <CheckCircle2 className="size-3" /> اعتبار نسخه تأیید شد
              </span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
