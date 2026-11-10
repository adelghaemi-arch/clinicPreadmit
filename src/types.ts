export type RoleId =
  | 'management'
  | 'physician'
  | 'reception'
  | 'nursing'
  | 'finance'
  | 'patient';

export type InsuranceKind =
  | 'تأمین اجتماعی'
  | 'بیمه سلامت'
  | 'آزاد'
  | 'نیروهای مسلح';

export type AppointmentStatus =
  | 'scheduled'
  | 'arrived'
  | 'waiting'
  | 'in-progress'
  | 'done'
  | 'canceled';

export type AppointmentType = 'ویزیت اول' | 'ویزیت مجدد' | 'مشاوره' | 'پیگیری';

export type Gender = 'زن' | 'مرد';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subspecialty?: string;
  room: string;
  phone: string;
  experience: number;
  rating: number;
  visitFee: number;
  capacity: number;
  color: string;
  active: boolean;
  shifts: { day: string; hours: string }[];
}

export interface Patient {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  birthDate: string;
  age: number;
  gender: Gender;
  insurance: InsuranceKind;
  supplementary: string;
  fileNo: string;
  blood: string;
  allergies: string[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  queueNo: number;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: AppointmentType;
  source: 'حضوری' | 'تلفنی' | 'آنلاین';
  room: string;
  paid: boolean;
  note?: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  appointmentId: string;
  bloodPressure: string;
  pulse: number;
  temperature: number;
  spo2: number;
  glucose: number;
  weight: number;
  height: number;
  bmi: number;
  note: string;
  recordedBy: string;
  recordedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  icd: string;
  notes: string;
  followUp: string;
  status: 'ثبت‌شده' | 'پیش‌نویس';
}

export interface PrescriptionItem {
  name: string;
  dose: string;
  duration: string;
}

export interface Prescription {
  id: string;
  code: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  labs: string[];
  imaging: string[];
  note: string;
  insurance: InsuranceKind;
}

export interface OrderItem {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'تزریقات' | 'پانسمان' | 'سرم‌تراپی' | 'نوار قلب' | 'نمونه‌گیری';
  title: string;
  status: 'در انتظار' | 'در حال انجام' | 'انجام شد';
  room: string;
  time: string;
  date: string;
  note?: string;
}

export interface InvoiceItem {
  title: string;
  qty: number;
  unit: number;
}

export interface Invoice {
  id: string;
  no: string;
  patientId: string;
  doctorId?: string;
  date: string;
  items: InvoiceItem[];
  insuranceShare: number;
  supplementaryShare: number;
  patientShare: number;
  paidAmount: number;
  method?: 'نقدی' | 'کارت‌خوان' | 'درگاه آنلاین' | 'بیمه';
  status: 'پرداخت‌نشده' | 'پرداخت جزئی' | 'تسویه‌شده';
  cashier?: string;
}

export interface InsuranceDoc {
  id: string;
  no: string;
  patientId: string;
  insurer: string;
  kind: 'پایه' | 'تکمیلی';
  amount: number;
  date: string;
  status: 'پیش‌نویس' | 'ارسال‌شده' | 'پذیرفته‌شده' | 'رد‌شده';
  trackingCode?: string;
}

export interface Tariff {
  id: string;
  code: string;
  title: string;
  category: string;
  basePrice: number;
  insuranceCoverage: number;
  active: boolean;
}

export interface Referral {
  id: string;
  patientId: string;
  fromDoctor: string;
  to: string;
  reason: string;
  date: string;
  priority: 'عادی' | 'فوری';
  status: 'در انتظار' | 'پذیرفته‌شده';
}

export interface StaffUser {
  id: string;
  name: string;
  role: RoleId;
  title: string;
  phone: string;
  doctorId?: string;
  patientId?: string;
  department: string;
}

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}

export interface NavItem {
  id: string;
  label: string;
  short: string;
  icon: import('lucide-react').LucideIcon;
  badge?: string;
}
