import { useMemo, useState } from 'react';
import { CheckCircle2, Pencil, Percent, RotateCcw, Search, Tags, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { useApp } from '../../store/AppStore';
import { faDigits, money, num } from '../../lib/utils';
import type { Tariff } from '../../types';

const categories = ['همه', 'ویزیت', 'پاراکلینیک', 'آزمایشگاه', 'پرستاری'];

export function TariffsPage() {
  const { tariffs, updateTariff, notify } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('همه');
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { basePrice: number; insuranceCoverage: number }>>(
    () =>
      Object.fromEntries(
        tariffs.map((t) => [t.id, { basePrice: t.basePrice, insuranceCoverage: t.insuranceCoverage }]),
      ),
  );

  const filtered = useMemo(
    () =>
      tariffs.filter(
        (t) =>
          (category === 'همه' || t.category === category) &&
          (t.title.includes(query) || t.code.toLowerCase().includes(query.toLowerCase())),
      ),
    [tariffs, category, query],
  );

  const active = tariffs.filter((t) => t.active);
  const activeVisits = active.filter((t) => t.category === 'ویزیت');
  const avgCoverage = Math.round(
    tariffs.reduce((acc, t) => acc + t.insuranceCoverage, 0) / Math.max(tariffs.length, 1),
  );
  const avgVisitFee = Math.round(
    activeVisits.reduce((acc, t) => acc + t.basePrice, 0) / Math.max(activeVisits.length, 1),
  );

  const startEdit = () => {
    setDrafts(
      Object.fromEntries(
        tariffs.map((t) => [t.id, { basePrice: t.basePrice, insuranceCoverage: t.insuranceCoverage }]),
      ),
    );
    setEditing(true);
  };

  const save = () => {
    tariffs.forEach((t) => {
      const draft = drafts[t.id];
      if (draft && (draft.basePrice !== t.basePrice || draft.insuranceCoverage !== t.insuranceCoverage)) {
        updateTariff(t.id, draft);
      }
    });
    setEditing(false);
    notify('success', 'تعرفه‌های خدمات ذخیره شد', 'تغییرات روی فاکتورهای جدید اعمال می‌شود.');
  };

  const cancel = () => {
    setDrafts(
      Object.fromEntries(
        tariffs.map((t) => [t.id, { basePrice: t.basePrice, insuranceCoverage: t.insuranceCoverage }]),
      ),
    );
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="تعرفه‌ها و خدمات"
        description="مدیریت کتاب ارزش نسبی خدمات سلامت، تعرفه ویزیت و درصد پوشش بیمه‌های پایه و تکمیلی."
        badge={<Badge tone="success" dot>به‌روزرسانی: امروز</Badge>}
        actions={
          editing ? (
            <>
              <button type="button" onClick={cancel} className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs">
                <RotateCcw className="size-3.5" /> انصراف
              </button>
              <button type="button" onClick={save} className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs">
                <CheckCircle2 className="size-3.5" /> ذخیره تغییرات
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={startEdit} className="btn btn-sm gap-1.5 rounded-xl border-base-300 bg-base-100 text-xs">
                <Pencil className="size-3.5" /> ویرایش گروهی
              </button>
              <button type="button" onClick={() => setAddOpen(true)} className="btn btn-sm btn-primary rounded-xl text-xs">
                افزودن خدمت
              </button>
            </>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="خدمات فعال" value={num(active.length)} icon={Tags} tone="teal" hint={`از ${num(tariffs.length)} خدمت تعریف‌شده`} />
        <StatCard label="میانگین پوشش بیمه" value={`${num(avgCoverage)}٪`} icon={Percent} tone="sky" hint="بر پایه تعرفه‌های فعال" />
        <StatCard label="میانگین تعرفه ویزیت" value={money(avgVisitFee)} icon={Wallet} tone="emerald" hint="ویزیت تخصصی و فوق‌تخصصی" />
        <StatCard label="سهم بیمار (میانگین)" value={`${num(100 - avgCoverage)}٪`} icon={Percent} tone="amber" hint="قبل از بیمه تکمیلی" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-base-content/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی کد یا عنوان خدمت..."
              className={`${inputClass} pr-9`}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-base-200/80 p-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                  category === item ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/55'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {editing ? <Badge tone="warning" dot>حالت ویرایش فعال</Badge> : null}
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-[10px] text-base-content/45">
                <th className="font-medium">کد</th>
                <th className="font-medium">عنوان خدمت</th>
                <th className="font-medium">دسته</th>
                <th className="font-medium">تعرفه پایه (تومان)</th>
                <th className="font-medium">پوشش بیمه</th>
                <th className="font-medium">سهم بیمار</th>
                <th className="font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tariff) => {
                const draft = drafts[tariff.id] ?? {
                  basePrice: tariff.basePrice,
                  insuranceCoverage: tariff.insuranceCoverage,
                };
                return (
                  <tr key={tariff.id} className="border-base-300/50">
                    <td className="text-[10px] font-mono text-base-content/45" dir="ltr">{tariff.code}</td>
                    <td className="text-[11px] font-medium text-base-content">{tariff.title}</td>
                    <td>
                      <Badge tone={tariff.category === 'ویزیت' ? 'primary' : 'neutral'}>{tariff.category}</Badge>
                    </td>
                    <td>
                      {editing ? (
                        <input
                          type="number"
                          value={draft.basePrice}
                          step={10_000}
                          min={0}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [tariff.id]: { ...draft, basePrice: Number(e.target.value) },
                            }))
                          }
                          className={`${inputClass} w-32 py-1 text-[11px]`}
                        />
                      ) : (
                        <span className="text-[11px] text-base-content/70">{money(tariff.basePrice)}</span>
                      )}
                    </td>
                    <td>
                      {editing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={draft.insuranceCoverage}
                            min={0}
                            max={100}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [tariff.id]: {
                                  ...draft,
                                  insuranceCoverage: Math.min(100, Number(e.target.value)),
                                },
                              }))
                            }
                            className={`${inputClass} w-16 py-1 text-[11px]`}
                          />
                          <span className="text-[10px] text-base-content/40">٪</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-base-200">
                            <div className="h-full rounded-full bg-success" style={{ width: `${tariff.insuranceCoverage}%` }} />
                          </div>
                          <span className="text-[10px] text-base-content/50">{faDigits(tariff.insuranceCoverage)}٪</span>
                        </div>
                      )}
                    </td>
                    <td className="text-[11px] font-medium text-base-content/70">
                      {money(Math.round((draft.basePrice * (100 - draft.insuranceCoverage)) / 100))}
                    </td>
                    <td>
                      <label className="flex cursor-pointer items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={tariff.active}
                          onChange={() => {
                            updateTariff(tariff.id, { active: !tariff.active });
                            notify('info', 'وضعیت خدمت تغییر کرد', tariff.title);
                          }}
                          className="toggle toggle-success toggle-xs"
                        />
                        <span className="text-[10px] text-base-content/50">{tariff.active ? 'فعال' : 'غیرفعال'}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-base-300/60 pt-3 text-[10px] text-base-content/45">
          <span>{faDigits(filtered.length)} خدمت نمایش داده شده</span>
          <span>آخرین به‌روزرسانی کتاب تعرفه: ۱۴۰۵/۰۸/۱۲ — وزارت بهداشت</span>
        </div>
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="افزودن خدمت جدید"
        description="تعریف خدمت و تعیین تعرفه پایه و پوشش بیمه"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="btn btn-sm rounded-xl border-base-300 bg-base-100">
              انصراف
            </button>
            <button
              type="button"
              onClick={() => {
                setAddOpen(false);
                notify('success', 'خدمت جدید ثبت شد', 'برای اعمال در فاکتورها، تعرفه را ذخیره کنید.');
              }}
              className="btn btn-sm btn-primary rounded-xl"
            >
              ثبت خدمت
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="کد خدمت" required>
              <input className={inputClass} placeholder="V-106" defaultValue="V-106" />
            </Field>
            <Field label="دسته خدمت" required>
              <select className={selectClass} defaultValue="ویزیت">
                {categories.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="عنوان خدمت" required>
            <input className={inputClass} placeholder="ویزیت فوق‌تخصصی قلب" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تعرفه پایه (تومان)" required>
              <input type="number" className={inputClass} defaultValue={890000} step={10000} />
            </Field>
            <Field label="درصد پوشش بیمه">
              <input type="number" className={inputClass} defaultValue={60} min={0} max={100} />
            </Field>
          </div>
          <div className="rounded-lg bg-info/5 px-3 py-2 text-[10px] leading-5 text-info">
            پس از ثبت، خدمت در فهرست تعرفه‌ها قابل ویرایش خواهد بود. این عملیات در نسخه نمایشی فقط شبیه‌سازی می‌شود.
          </div>
        </div>
      </Modal>

      <TariffLegend tariffs={tariffs} />
    </div>
  );
}

function TariffLegend({ tariffs }: { tariffs: Tariff[] }) {
  const byCategory = categories.slice(1).map((cat) => ({
    cat,
    count: tariffs.filter((t) => t.category === cat).length,
    total: tariffs.filter((t) => t.category === cat).reduce((a, t) => a + t.basePrice, 0),
  }));
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {byCategory.map((item) => (
        <Card key={item.cat} className="flex items-center gap-3 py-3">
          <span className="grid size-9 place-items-center rounded-xl bg-base-200 text-base-content/60">
            <Tags className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-base-content">{item.cat}</p>
            <p className="text-[10px] text-base-content/45">{faDigits(item.count)} خدمت</p>
          </div>
          <p className="ms-auto text-[11px] font-bold text-base-content/70">{money(item.total)}</p>
        </Card>
      ))}
    </div>
  );
}
