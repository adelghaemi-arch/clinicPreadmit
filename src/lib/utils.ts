export const faDigits = (value: string | number): string =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] as string);

export const toEnDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

export const num = (value: number): string =>
  faDigits(value.toLocaleString('en-US')).replace(/,/g, '٬');

export const money = (value: number): string => `${num(value)} تومان`;

export const compactMoney = (value: number): string => {
  if (value >= 1_000_000_000) return `${faDigits((value / 1_000_000_000).toFixed(1))} میلیارد`;
  if (value >= 1_000_000) return `${faDigits(Math.round(value / 1_000_000))} میلیون`;
  return num(value);
};

export const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');

export const uid = (prefix = 'id'): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO date (yyyy-mm-dd) in local time, usable with <input type="date"> */
export const isoDate = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayIso = (): string => isoDate();

export const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

export const parseIso = (iso: string): Date => new Date(`${iso}T00:00:00`);

const jalaliFull = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const jalaliShort = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'long',
});

const jalaliNumeric = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const weekdayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
});

export const faFullDate = (iso: string): string => {
  try {
    return jalaliFull.format(parseIso(iso)).replace('،', '');
  } catch {
    return iso;
  }
};

export const faShortDate = (iso: string): string => {
  try {
    return jalaliShort.format(parseIso(iso));
  } catch {
    return iso;
  }
};

export const faNumericDate = (iso: string): string => {
  try {
    return jalaliNumeric.format(parseIso(iso));
  } catch {
    return iso;
  }
};

export const faWeekday = (iso: string): string => {
  try {
    return weekdayFormatter.format(parseIso(iso));
  } catch {
    return '';
  }
};

export const relativeToToday = (iso: string): string => {
  const today = todayIso();
  if (iso === today) return 'امروز';
  if (iso === addDays(today, 1)) return 'فردا';
  if (iso === addDays(today, -1)) return 'دیروز';
  return faFullDate(iso);
};

export const initials = (name: string): string => {
  const clean = name.replace(/^(دکتر|خانم|آقای)\s+/, '').trim();
  const parts = clean.split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join('‌');
};

export const bmiOf = (heightCm: number, weightKg: number): number => {
  if (!heightCm || !weightKg) return 0;
  return Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
};

export const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

export const invoiceTotal = (items: { qty: number; unit: number }[]): number =>
  sum(items.map((i) => i.qty * i.unit));

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const randomFrom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)] as T;

export const persianWeekDays = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
