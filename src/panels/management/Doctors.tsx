import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarRange,
  Filter,
  Search,
  Star,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Field, inputClass, selectClass } from '../../components/ui/Field';
import { useApp } from '../../store/AppStore';
import { doctors } from '../../data/mock';
import { faDigits, money, num, persianWeekDays, todayIso } from '../../lib/utils';
import type { Doctor } from '../../types';

export function DoctorsPage() {
  const { appointments, notify } = useApp();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [scheduleDoctor, setScheduleDoctor] = useState<Doctor | null>(null);

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialty))),
    [],
  );

  const filtered = doctors.filter(
    (d) =>
      (specialty === 'all' || d.specialty === specialty) &&
      (d.name.includes(query) || d.specialty.includes(query) || d.room.includes(query)),
  );

  const today = todayIso();
  const avgRating = (doctors.reduce((acc, d) => acc + d.rating, 0) / doctors.length).toFixed(1);
  const avgExperience = Math.round(doctors.reduce((acc, d) => acc + d.experience, 0) / doctors.length);

  return (
    <div className="space-y-5">
      <PageHeader
        title="پزشکان و شیفت‌ها"
        description="مدیریت برنامه حضور پزشکان، ظرفیت نوبت‌دهی، مرخصی‌ها و سهمیه روزانه هر متخصص."
        actions={
          <button
            type="button"
            onClick={() =>
              notify('info', 'افزودن پزشک جدید', 'در این نسخه نمایشی، فرم ثبت پزشک به‌صورت نمونه نمایش داده می‌شود.')
            }
            className="btn btn-sm btn-primary gap-1.5 rounded-xl text-xs"
          >
            <UserRound className="size-3.5" /> افزودن پزشک
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="پزشکان کلینیک" value={`${num(doctors.length)} نفر`} icon={Stethoscope} tone="teal" hint="۸ تخصص فعال" />
        <StatCard label="ظرفیت نوبت روزانه" value={num(doctors.reduce((a, d) => a + d.capacity, 0))} icon={CalendarRange} tone="sky" hint="در ۱۸ اتاق معاینه" />
        <StatCard label="میانگین رضایت" value={`${num(Number(avgRating))} از ۵`} icon={Star} tone="amber" hint="بر اساس نظرسنجی مراجعین" />
        <StatCard label="میانگین سابقه" value={`${num(avgExperience)} سال`} icon={BadgeCheck} tone="indigo" hint="اعضای هیئت علمی و متخصصین" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-base-content/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی نام پزشک، تخصص یا اتاق..."
              className={`${inputClass} pr-9`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-base-content/35" />
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={`${selectClass} w-44`}>
              <option value="all">همه تخصص‌ها</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Badge tone="neutral">{faDigits(filtered.length)} پزشک</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-[10px] text-base-content/45">
                <th className="font-medium">پزشک</th>
                <th className="font-medium">تخصص</th>
                <th className="font-medium">اتاق</th>
                <th className="font-medium">ظرفیت امروز</th>
                <th className="font-medium">تعرفه ویزیت</th>
                <th className="font-medium">رضایت</th>
                <th className="font-medium">وضعیت</th>
                <th className="font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doctor) => {
                const used = appointments.filter(
                  (a) => a.doctorId === doctor.id && a.date === today && a.status !== 'canceled',
                ).length;
                return (
                  <tr key={doctor.id} className="border-base-300/50 transition hover:bg-base-200/40">
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={doctor.name} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-base-content">{doctor.name}</p>
                          <p className="text-[10px] text-base-content/45">{doctor.subspecialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[11px] text-base-content/65">{doctor.specialty}</td>
                    <td className="text-[11px] text-base-content/65">{doctor.room}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium">{faDigits(used)}</span>
                        <span className="text-[10px] text-base-content/35">از {faDigits(doctor.capacity)}</span>
                      </div>
                      <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-base-200">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min((used / doctor.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="text-[11px] text-base-content/65">{money(doctor.visitFee)}</td>
                    <td>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-500">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {num(doctor.rating)}
                      </span>
                    </td>
                    <td>
                      <Badge tone={doctor.active ? 'success' : 'neutral'} dot>
                        {doctor.active ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setScheduleDoctor(doctor)}
                          className="rounded-lg border border-base-300 px-2 py-1 text-[10px] text-base-content/65 transition hover:bg-base-200"
                        >
                          شیفت‌ها
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(doctor)}
                          className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary transition hover:bg-primary/20"
                        >
                          جزئیات
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="جدول شیفت هفتگی"
          subtitle="برنامه حضور پزشکان در کلینیک — قابل ویرایش توسط مدیر"
          icon={CalendarRange}
          action={<Badge tone="info">{faDigits(persianWeekDays.length)} روز هفته</Badge>}
        />
        <div className="overflow-x-auto">
          <table className="table table-sm min-w-[760px]">
            <thead>
              <tr className="text-[10px] text-base-content/45">
                <th className="sticky right-0 bg-base-100 font-medium">پزشک</th>
                {persianWeekDays.map((day) => (
                  <th key={day} className="text-center font-medium">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.slice(0, 6).map((doctor) => (
                <tr key={doctor.id} className="border-base-300/50">
                  <td className="sticky right-0 bg-base-100">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={doctor.name} size="xs" />
                      <span className="whitespace-nowrap text-[10px] font-medium">{doctor.name.replace('دکتر ', '')}</span>
                    </div>
                  </td>
                  {persianWeekDays.map((day) => {
                    const shift = doctor.shifts.find((s) => s.day === day);
                    return (
                      <td key={day} className="text-center">
                        {shift ? (
                          <span className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary whitespace-nowrap">
                            {shift.hours}
                          </span>
                        ) : (
                          <span className="text-[9px] text-base-content/25">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-base-content/40">
          <Users className="size-3" /> برای مشاهده شیفت کامل هر پزشک روی دکمه «شیفت‌ها» در جدول بالا بزنید.
        </p>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        description={selected ? `${selected.specialty} · ${selected.subspecialty ?? ''}` : undefined}
        footer={
          <>
            <button type="button" className="btn btn-sm rounded-xl border-base-300 bg-base-100" onClick={() => setSelected(null)}>
              بستن
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-xl"
              onClick={() => {
                notify('success', 'اطلاعات پزشک ذخیره شد', selected?.name);
                setSelected(null);
              }}
            >
              تأیید اطلاعات
            </button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-base-200/60 p-3">
              <Avatar name={selected.name} size="lg" />
              <div>
                <p className="text-sm font-bold text-base-content">{selected.name}</p>
                <p className="text-[11px] text-base-content/55">{selected.subspecialty}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="success">{selected.room}</Badge>
                  <Badge tone="warning">⭐ {num(selected.rating)}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['تخصص', selected.specialty],
                ['سابقه کار', `${num(selected.experience)} سال`],
                ['تلفن داخلی', selected.phone],
                ['ظرفیت نوبت روزانه', `${num(selected.capacity)} نوبت`],
                ['تعرفه ویزیت', money(selected.visitFee)],
                ['وضعیت همکاری', selected.active ? 'فعال' : 'غیرفعال'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-base-300/60 px-3 py-2">
                  <p className="text-[10px] text-base-content/45">{label}</p>
                  <p className="mt-0.5 font-medium text-base-content">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold text-base-content/60">برنامه حضور هفتگی</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.shifts.map((shift) => (
                  <Badge key={shift.day} tone="primary">
                    {shift.day} — {shift.hours}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(scheduleDoctor)}
        onClose={() => setScheduleDoctor(null)}
        title={`مدیریت شیفت ${scheduleDoctor?.name ?? ''}`}
        description="روزهای حضور، ساعات کاری و سهمیه نوبت‌دهی"
        footer={
          <button
            type="button"
            className="btn btn-sm btn-primary rounded-xl"
            onClick={() => {
              notify('success', 'شیفت پزشک به‌روزرسانی شد', scheduleDoctor?.name);
              setScheduleDoctor(null);
            }}
          >
            ذخیره تغییرات
          </button>
        }
      >
        {scheduleDoctor ? (
          <div className="space-y-3">
            <Field label="ظرفیت نوبت‌دهی روزانه">
              <input type="number" defaultValue={scheduleDoctor.capacity} className={inputClass} min={1} max={40} />
            </Field>
            {persianWeekDays.map((day) => {
              const shift = scheduleDoctor.shifts.find((s) => s.day === day);
              return (
                <div key={day} className="flex items-center gap-3 rounded-lg border border-base-300/60 p-2">
                  <label className="flex flex-1 items-center gap-2 text-xs text-base-content/70">
                    <input type="checkbox" defaultChecked={Boolean(shift)} className="toggle toggle-primary toggle-sm" />
                    {day}
                  </label>
                  <input
                    type="text"
                    defaultValue={shift?.hours ?? ''}
                    placeholder="۸:۰۰ - ۱۳:۰۰"
                    className={`${inputClass} max-w-40 py-1 text-xs`}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
