import {
  Activity,
  Ambulance,
  BarChart3,
  Building2,
  CalendarClock,
  CalendarPlus,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  ListOrdered,
  NotebookPen,
  Pill,
  Receipt,
  Search,
  Stethoscope,
  Syringe,
  Tags,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavItem, RoleId } from '../types';

export interface PanelMeta {
  id: RoleId;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  nav: NavItem[];
}

export const panelMeta: Record<RoleId, PanelMeta> = {
  management: {
    id: 'management',
    title: 'مدیریت و ریاست کلینیک',
    shortTitle: 'مدیریت',
    description: 'نظارت کلان بر عملکرد، درآمد، شیفت پزشکان و تعرفه‌های کلینیک',
    icon: Building2,
    gradient: 'from-teal-500 to-emerald-500',
    nav: [
      { id: 'dashboard', label: 'داشبورد مدیریتی', short: 'داشبورد', icon: LayoutDashboard },
      { id: 'doctors', label: 'پزشکان و شیفت‌ها', short: 'پزشکان', icon: Stethoscope },
      { id: 'reports', label: 'گزارش‌های عملکردی', short: 'گزارش‌ها', icon: BarChart3 },
      { id: 'tariffs', label: 'تعرفه‌ها و خدمات', short: 'تعرفه‌ها', icon: Tags },
    ],
  },
  physician: {
    id: 'physician',
    title: 'پنل پزشکان متخصص',
    shortTitle: 'پزشک',
    description: 'مدیریت نوبت‌ها، پرونده الکترونیک، ثبت ویزیت و نسخه‌نویسی',
    icon: Stethoscope,
    gradient: 'from-rose-500 to-pink-500',
    nav: [
      { id: 'appointments', label: 'نوبت‌های امروز', short: 'نوبت‌ها', icon: CalendarClock },
      { id: 'ehr', label: 'پرونده الکترونیک بیمار', short: 'پرونده', icon: FileText },
      { id: 'visit', label: 'ثبت ویزیت و شرح حال', short: 'ویزیت', icon: NotebookPen },
      { id: 'prescription', label: 'نسخه الکترونیک', short: 'نسخه', icon: Pill },
    ],
  },
  reception: {
    id: 'reception',
    title: 'پذیرش و نوبت‌دهی',
    shortTitle: 'پذیرش',
    description: 'تشکیل پرونده، رزرو نوبت، پذیرش روز و مدیریت صف انتظار',
    icon: CalendarPlus,
    gradient: 'from-sky-500 to-indigo-500',
    nav: [
      { id: 'patients', label: 'جستجو و تشکیل پرونده', short: 'پرونده‌ها', icon: Search },
      { id: 'scheduling', label: 'نوبت‌دهی و تقویم', short: 'نوبت‌دهی', icon: CalendarPlus },
      { id: 'admission', label: 'پذیرش روز و صندوق', short: 'پذیرش', icon: ClipboardCheck },
      { id: 'queue', label: 'صف انتظار هوشمند', short: 'صف انتظار', icon: ListOrdered },
    ],
  },
  nursing: {
    id: 'nursing',
    title: 'پرستاری و خدمات سرپایی',
    shortTitle: 'پرستاری',
    description: 'تریاژ، ثبت علائم حیاتی، تزریقات، پانسمان و اورژانس سرپایی',
    icon: Activity,
    gradient: 'from-amber-600 to-orange-600',
    nav: [
      { id: 'triage', label: 'تریاژ و علائم حیاتی', short: 'تریاژ', icon: Activity },
      { id: 'services', label: 'تزریقات و پانسمان', short: 'خدمات', icon: Syringe },
      { id: 'emergency', label: 'اورژانس سرپایی', short: 'اورژانس', icon: Ambulance },
    ],
  },
  finance: {
    id: 'finance',
    title: 'مالی، صندوق و بیمه‌ها',
    shortTitle: 'مالی',
    description: 'تسویه فاکتورها، رسیدگی به اسناد بیمه‌ای و گزارش‌های مالی',
    icon: Wallet,
    gradient: 'from-emerald-500 to-teal-500',
    nav: [
      { id: 'cashier', label: 'صندوق و پرداخت', short: 'صندوق', icon: CreditCard },
      { id: 'insurance', label: 'اسناد بیمه‌ای', short: 'بیمه', icon: FileCheck2 },
      { id: 'reports', label: 'گزارش مالی و بستن صندوق', short: 'گزارش مالی', icon: Wallet },
    ],
  },
  patient: {
    id: 'patient',
    title: 'پورتال بیماران',
    shortTitle: 'بیمار',
    description: 'رزرو نوبت آنلاین، سوابق ویزیت، نسخ الکترونیک و پرداخت‌ها',
    icon: HeartHandshake,
    gradient: 'from-fuchsia-500 to-purple-500',
    nav: [
      { id: 'book', label: 'نوبت‌دهی آنلاین', short: 'رزرو نوبت', icon: CalendarPlus },
      { id: 'records', label: 'سوابق پزشکی من', short: 'سوابق', icon: FileText },
      { id: 'prescriptions', label: 'نسخ الکترونیک من', short: 'نسخ', icon: Pill },
      { id: 'payments', label: 'پرداخت‌ها و فاکتورها', short: 'پرداخت‌ها', icon: Receipt },
    ],
  },
};

export const panelList = Object.values(panelMeta);
