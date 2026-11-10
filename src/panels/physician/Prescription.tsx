import { useState } from 'react';
import {
  Check,
  FlaskConical,
  Plus,
  Pill,
  Printer,
  ScanLine,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { Avatar } from '../../components/ui/Avatar';
import { useApp } from '../../store/AppStore';
import {
  diagnosisCatalog,
  drugCatalog,
  getPatient,
  imagingCatalog,
  labCatalog,
} from '../../data/mock';
import { faDigits, faShortDate, todayIso, uid } from '../../lib/utils';
import type { Prescription as PrescriptionType } from '../../types';

interface DrugRow {
  key: string;
  name: string;
  dose: string;
  duration: string;
}

const emptyDrug = (): DrugRow => ({
  key: uid('row'),
  name: '',
  dose: '',
  duration: '',
});

export function PrescriptionPage() {
  const { user, patients, prescriptions, addPrescription, notify } = useApp();
  const doctorId = user?.doctorId ?? 'd1';
  const [patientId, setPatientId] = useState(patients[0]?.id ?? 'p1');
  const [diagnosisCode, setDiagnosisCode] = useState(diagnosisCatalog[0]?.code ?? '');
  const [drugs, setDrugs] = useState<DrugRow[]>([emptyDrug()]);
  const [labs, setLabs] = useState<string[]>([]);
  const [imaging, setImaging] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [issued, setIssued] = useState<PrescriptionType | null>(null);

  const patient = getPatient(patientId);
  const diagnosis = diagnosisCatalog.find((d) => d.code === diagnosisCode);
  const history = prescriptions.filter((p) => p.patientId === patientId);

  const toggle = (list: string[], value: string, setter: (list: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const setDrug = (key: string, patch: Partial<DrugRow>) => {
    setDrugs((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const submit = () => {
    const validDrugs = drugs.filter((d) => d.name.trim());
    if (!diagnosis) {
      notify('warning', 'تشخیص را انتخاب کنید');
      return;
    }
    if (validDrugs.length === 0 && labs.length === 0 && imaging.length === 0) {
      notify('warning', 'نسخه خالی است', 'حداقل یک دارو، آزمایش یا درخواست تصویربرداری اضافه کنید.');
      return;
    }
    if (validDrugs.some((d) => !d.dose.trim() || !d.duration.trim())) {
      notify('warning', 'دوز و مدت مصرف الزامی است', 'برای همه داروهای نسخه، دوز و مدت مصرف را کامل کنید.');
      return;
    }
    const prescription = addPrescription({
      patientId,
      doctorId,
      date: todayIso(),
      diagnosis: diagnosis.title.split('(')[0]?.trim() ?? diagnosis.title,
      items: validDrugs.map((d) => ({ name: d.name, dose: d.dose, duration: d.duration })),
      labs,
      imaging,
      note,
      insurance: patient?.insurance ?? 'آزاد',
    });
    setIssued(prescription);
    notify('success', 'نسخه الکترونیک صادر شد', `کد رهگیری: ${prescription.code}`);
    setDrugs([emptyDrug()]);
    setLabs([]);
    setImaging([]);
    setNote('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="نسخه‌نویسی الکترونیک"
        description="صدور نسخه دارویی، درخواست آزمایش و تصویربرداری با کد رهگیری بیمه."
        badge={<Badge tone="success" dot>اتصال به سامانه بیمه سلامت</Badge>}
        actions={
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="input input-sm h-9 w-56 rounded-xl border-base-300 bg-base-100 text-xs clinic-select"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.insurance}</option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="نسخه جدید"
            subtitle="داروها و درخواست‌های پاراکلینیک را مشخص کنید"
            icon={Pill}
            action={<Badge tone="info">{faDigits(drugs.filter((d) => d.name).length)} دارو</Badge>}
          />

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-base-200/60 p-3">
            <Avatar name={patient?.name ?? ''} size="md" />
            <div className="flex-1">
              <p className="text-xs font-bold text-base-content">{patient?.name}</p>
              <p className="text-[10px] text-base-content/50">
                {faDigits(patient?.age ?? 0)} ساله · {patient?.insurance}
                {patient?.supplementary && patient.supplementary !== '—' ? ` + ${patient.supplementary}` : ''}
              </p>
            </div>
            {patient?.allergies.length ? (
              <Badge tone="error">حساسیت: {patient.allergies.join('، ')}</Badge>
            ) : (
              <Badge tone="success">بدون حساسیت دارویی</Badge>
            )}
          </div>

          <div className="space-y-4">
            <Field label="تشخیص" required>
              <select value={diagnosisCode} onChange={(e) => setDiagnosisCode(e.target.value)} className={selectClass}>
                {diagnosisCatalog.map((d) => (
                  <option key={d.code} value={d.code}>{d.title}</option>
                ))}
              </select>
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-base-content/70">اقلام دارویی</p>
                <button
                  type="button"
                  onClick={() => setDrugs((rows) => [...rows, emptyDrug()])}
                  className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20"
                >
                  <Plus className="size-3" /> افزودن دارو
                </button>
              </div>
              <div className="space-y-2">
                {drugs.map((drug, index) => (
                  <div key={drug.key} className="grid grid-cols-12 items-end gap-2 rounded-xl border border-base-300/60 p-2">
                    <div className="col-span-12 sm:col-span-6">
                      <span className="mb-1 block text-[9px] text-base-content/40">دارو {faDigits(index + 1)}</span>
                      <select
                        value={drug.name}
                        onChange={(e) => setDrug(drug.key, { name: e.target.value })}
                        className={`${inputClass} clinic-select py-1.5 text-[11px]`}
                      >
                        <option value="">انتخاب دارو...</option>
                        {drugCatalog.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-5 sm:col-span-3">
                      <span className="mb-1 block text-[9px] text-base-content/40">دوز مصرف</span>
                      <input
                        value={drug.dose}
                        onChange={(e) => setDrug(drug.key, { dose: e.target.value })}
                        placeholder="۱ عدد"
                        className={`${inputClass} clinic-select py-1.5 text-[11px]`}
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                      <span className="mb-1 block text-[9px] text-base-content/40">مدت</span>
                      <input
                        value={drug.duration}
                        onChange={(e) => setDrug(drug.key, { duration: e.target.value })}
                        placeholder="۳۰ روز"
                        className={`${inputClass} clinic-select py-1.5 text-[11px]`}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => setDrugs((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== drug.key) : rows))}
                        className="grid size-8 place-items-center rounded-lg text-base-content/35 hover:bg-error/10 hover:text-error"
                        aria-label="حذف دارو"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-base-content/70">
                <FlaskConical className="size-3.5 text-info" /> درخواست آزمایش
              </p>
              <div className="flex flex-wrap gap-1.5">
                {labCatalog.map((lab) => {
                  const selected = labs.includes(lab);
                  return (
                    <button
                      key={lab}
                      type="button"
                      onClick={() => toggle(labs, lab, setLabs)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] transition ${
                        selected
                          ? 'border-info/30 bg-info/10 font-medium text-info'
                          : 'border-base-300 text-base-content/55 hover:bg-base-200'
                      }`}
                    >
                      {selected ? <Check className="size-2.5" /> : <Plus className="size-2.5" />}
                      {lab}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-base-content/70">
                <ScanLine className="size-3.5 text-secondary" /> درخواست تصویربرداری
              </p>
              <div className="flex flex-wrap gap-1.5">
                {imagingCatalog.map((img) => {
                  const selected = imaging.includes(img);
                  return (
                    <button
                      key={img}
                      type="button"
                      onClick={() => toggle(imaging, img, setImaging)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] transition ${
                        selected
                          ? 'border-secondary/30 bg-secondary/10 font-medium text-secondary'
                          : 'border-base-300 text-base-content/55 hover:bg-base-200'
                      }`}
                    >
                      {selected ? <Check className="size-2.5" /> : <Plus className="size-2.5" />}
                      {img}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="توضیحات و توصیه‌ها">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="توصیه‌های غیردارویی، رژیم غذایی یا هشدارهای لازم..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-300/60 pt-3">
              <p className="text-[10px] leading-5 text-base-content/45">
                بیمه: {patient?.insurance} · نسخه پس از صدور قابل ویرایش نیست.
              </p>
              <button type="button" onClick={submit} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                <Send className="size-3.5" /> ثبت و صدور نسخه
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="نسخ اخیر بیمار"
              subtitle={patient?.name}
              icon={UserRound}
              action={<Badge tone="neutral">{faDigits(history.length)} نسخه</Badge>}
            />
            {history.length ? (
              <div className="space-y-2">
                {history.map((rx) => (
                  <div key={rx.id} className="rounded-xl border border-base-300/60 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-base-content/75">{rx.diagnosis}</p>
                      <span className="text-[9px] text-base-content/35">{faShortDate(rx.date)}</span>
                    </div>
                    <p className="mt-1 font-mono text-[9px] text-base-content/40" dir="ltr">{rx.code}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {rx.items.slice(0, 3).map((item) => (
                        <Badge key={item.name} tone="primary">{item.name.split(' ')[0]}</Badge>
                      ))}
                      {rx.labs.length ? <Badge tone="info">{faDigits(rx.labs.length)} آزمایش</Badge> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] leading-5 text-base-content/40">
                برای این بیمار نسخه‌ای ثبت نشده است. اولین نسخه را از فرم روبه‌رو صادر کنید.
              </p>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-primary/5">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-base-content">
              <Check className="size-3.5 text-success" /> نکات نسخه‌نویسی
            </p>
            <ul className="mt-2 space-y-1.5 text-[10px] leading-5 text-base-content/55">
              <li>• نام ژنریک دارو و دوز دقیق را ثبت کنید.</li>
              <li>• تداخلات دارویی به‌صورت خودکار بررسی می‌شود.</li>
              <li>• برای بیمه تکمیلی، کد رهگیری نسخه را در فاکتور درج کنید.</li>
              <li>• درخواست آزمایش و تصویربرداری نیازمند تأیید پزشک معالج است.</li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(issued)}
        onClose={() => setIssued(null)}
        title="نسخه الکترونیک صادر شد"
        description="کد رهگیری برای ارائه به داروخانه و بیمه"
        footer={
          <>
            <button
              type="button"
              onClick={() => notify('info', 'پیش‌نمایش چاپ نسخه', 'در نسخه نمایشی، چاپ شبیه‌سازی می‌شود.')}
              className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs"
            >
              <Printer className="size-3.5" /> چاپ نسخه
            </button>
            <button type="button" onClick={() => setIssued(null)} className="btn btn-sm btn-primary rounded-xl text-xs">
              تأیید
            </button>
          </>
        }
      >
        {issued ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center">
              <p className="text-[10px] text-base-content/45">کد رهگیری نسخه</p>
              <p className="mt-1 font-mono text-base font-extrabold tracking-wider text-primary" dir="ltr">
                {issued.code}
              </p>
            </div>
            <div className="grid gap-1.5 text-[11px]">
              <div className="flex justify-between rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="text-base-content/50">بیمار</span>
                <span className="font-medium">{getPatient(issued.patientId)?.name}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="text-base-content/50">تشخیص</span>
                <span className="font-medium">{issued.diagnosis}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="text-base-content/50">داروها</span>
                <span className="font-medium">{faDigits(issued.items.length)} قلم</span>
              </div>
              <div className="flex justify-between rounded-lg bg-base-200/50 px-2.5 py-1.5">
                <span className="text-base-content/50">آزمایش / تصویربرداری</span>
                <span className="font-medium">{faDigits(issued.labs.length)} / {faDigits(issued.imaging.length)} مورد</span>
              </div>
            </div>
            <p className="text-[10px] leading-5 text-base-content/45">
              کد نسخه به سامانه بیمه ارسال شد. بیمار می‌تواند با همین کد در داروخانه‌های طرف قرارداد دارو دریافت کند.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
