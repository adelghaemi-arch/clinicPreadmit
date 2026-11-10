import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  appointments as seedAppointments,
  getDoctor,
  insuranceDocs as seedInsuranceDocs,
  invoices as seedInvoices,
  orders as seedOrders,
  patients as seedPatients,
  prescriptions as seedPrescriptions,
  referrals as seedReferrals,
  staffUsers,
  tariffs as seedTariffs,
  visits as seedVisits,
  vitals as seedVitals,
} from '../data/mock';
import type {
  Appointment,
  AppointmentType,
  InsuranceDoc,
  InsuranceKind,
  Invoice,
  OrderItem,
  Patient,
  Prescription,
  Referral,
  StaffUser,
  Tariff,
  ToastKind,
  ToastMessage,
  Visit,
  VitalSigns,
} from '../types';
import { isDarkTheme, oppositeTheme } from '../lib/themes';
import { panelMeta } from '../config/panels';
import { bmiOf, isoDate, todayIso, uid } from '../lib/utils';

interface NewPatientInput {
  name: string;
  nationalId: string;
  phone: string;
  birthDate: string;
  age: number;
  gender: 'زن' | 'مرد';
  insurance: InsuranceKind;
  supplementary: string;
  blood: string;
  allergies: string[];
}

interface BookingInput {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: AppointmentType;
  source: 'حضوری' | 'تلفنی' | 'آنلاین';
  note?: string;
}

interface AppContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  user: StaffUser | null;
  page: string;
  setPage: (page: string) => void;
  focusPatientId: string | null;
  setFocusPatient: (id: string | null) => void;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: StaffUser['role']) => void;
  findUserByPhone: (phone: string) => StaffUser | undefined;
  patients: Patient[];
  appointments: Appointment[];
  vitals: VitalSigns[];
  visits: Visit[];
  prescriptions: Prescription[];
  orders: OrderItem[];
  invoices: Invoice[];
  insuranceDocs: InsuranceDoc[];
  tariffs: Tariff[];
  referrals: Referral[];
  toasts: ToastMessage[];
  notify: (kind: ToastKind, title: string, description?: string) => void;
  dismissToast: (id: string) => void;
  addPatient: (input: NewPatientInput) => Patient;
  bookAppointment: (input: BookingInput) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  callNextPatient: (doctorId: string) => Appointment | null;
  saveVitals: (input: Omit<VitalSigns, 'id' | 'bmi' | 'recordedBy' | 'recordedAt'> & { recordedBy?: string }) => VitalSigns;
  addVisit: (input: Omit<Visit, 'id' | 'status'>) => Visit;
  addPrescription: (input: Omit<Prescription, 'id' | 'code'>) => Prescription;
  updateOrder: (id: string, patch: Partial<OrderItem>) => void;
  payInvoice: (id: string, method: NonNullable<Invoice['method']>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'no'>) => Invoice;
  submitInsuranceDoc: (id: string) => void;
  submitInsuranceDocs: (ids: string[]) => void;
  updateTariff: (id: string, patch: Partial<Tariff>) => void;
  addReferral: (input: Omit<Referral, 'id' | 'date' | 'status'>) => Referral;
}

const AppContext = createContext<AppContextValue | null>(null);

const readStoredUser = (): StaffUser | null => {
  try {
    const id = localStorage.getItem('mehr-session');
    return staffUsers.find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
};

const defaultPageFor = (role: StaffUser['role']): string =>
  panelMeta[role].nav[0]?.id ?? 'dashboard';

const readStoredTheme = (): string => {
  try {
    return localStorage.getItem('mehr-theme') ?? 'clinic';
  } catch {
    return 'clinic';
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(readStoredTheme);
  const [user, setUser] = useState<StaffUser | null>(readStoredUser);
  const [page, setPage] = useState<string>(() => {
    const stored = readStoredUser();
    return stored ? defaultPageFor(stored.role) : 'dashboard';
  });
  const [focusPatientId, setFocusPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>(seedPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);
  const [vitals, setVitals] = useState<VitalSigns[]>(seedVitals);
  const [visits, setVisits] = useState<Visit[]>(seedVisits);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(seedPrescriptions);
  const [orders, setOrders] = useState<OrderItem[]>(seedOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [insuranceDocs, setInsuranceDocs] = useState<InsuranceDoc[]>(seedInsuranceDocs);
  const [tariffs, setTariffs] = useState<Tariff[]>(seedTariffs);
  const [referrals, setReferrals] = useState<Referral[]>(seedReferrals);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isDark = isDarkTheme(theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    try {
      localStorage.setItem('mehr-theme', theme);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [theme, isDark]);

  const setTheme = useCallback((next: string) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((current) => oppositeTheme(current)),
    [],
  );

  const notify = useCallback((kind: ToastKind, title: string, description?: string) => {
    const id = uid('toast');
    setToasts((list) => [...list, { id, kind, title, description }]);
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const login = useCallback(
    (userId: string) => {
      const found = staffUsers.find((u) => u.id === userId) ?? null;
      setUser(found);
      setPage(found ? defaultPageFor(found.role) : 'dashboard');
      try {
        if (found) localStorage.setItem('mehr-session', found.id);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('mehr-session');
    } catch {
      /* ignore */
    }
  }, []);

  const switchRole = useCallback((role: StaffUser['role']) => {
    const found = staffUsers.find((u) => u.role === role);
    if (found) {
      setUser(found);
      setPage(defaultPageFor(found.role));
      try {
        localStorage.setItem('mehr-session', found.id);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const findUserByPhone = useCallback((phone: string): StaffUser | undefined => {
    const normalized = phone.replace(/\D/g, '').replace(/^98/, '0').replace(/^9/, '09');
    return staffUsers.find((u) => u.phone.replace(/\D/g, '') === normalized);
  }, []);

  const addPatient = useCallback(
    (input: NewPatientInput): Patient => {
      const created: Patient = {
        ...input,
        id: uid('p'),
        fileNo: String(14_034 + patients.length + 1),
        createdAt: todayIso(),
      };
      setPatients((list) => [created, ...list]);
      return created;
    },
    [patients.length],
  );

  const bookAppointment = useCallback(
    (input: BookingInput): Appointment => {
      const doctor = getDoctor(input.doctorId);
      const maxQueue = appointments
        .filter((a) => a.date === input.date)
        .reduce((max, a) => Math.max(max, a.queueNo), 0);
      const appointment: Appointment = {
        id: uid('a'),
        queueNo: maxQueue + 1,
        patientId: input.patientId,
        doctorId: input.doctorId,
        date: input.date,
        time: input.time,
        status: 'scheduled',
        type: input.type,
        source: input.source,
        room: doctor?.room ?? 'اتاق معاینه',
        paid: false,
        note: input.note,
      };
      setAppointments((list) => [...list, appointment]);
      return appointment;
    },
    [appointments],
  );

  const updateAppointment = useCallback((id: string, patch: Partial<Appointment>) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const callNextPatient = useCallback(
    (doctorId: string): Appointment | null => {
      const today = todayIso();
      const candidates = [...appointments]
        .filter(
          (a) =>
            a.doctorId === doctorId &&
            a.date === today &&
            (a.status === 'waiting' || a.status === 'arrived'),
        )
        .sort((a, b) => a.queueNo - b.queueNo);
      const next = candidates[0] ?? null;
      if (!next) return null;
      setAppointments((list) =>
        list.map((a) => {
          if (a.id === next.id) return { ...a, status: 'in-progress' };
          if (
            a.doctorId === doctorId &&
            a.date === today &&
            a.status === 'in-progress'
          ) {
            return { ...a, status: 'done' };
          }
          return a;
        }),
      );
      return { ...next, status: 'in-progress' };
    },
    [appointments],
  );

  const saveVitals = useCallback(
    (input: Omit<VitalSigns, 'id' | 'bmi' | 'recordedBy' | 'recordedAt'> & { recordedBy?: string }): VitalSigns => {
      const record: VitalSigns = {
        ...input,
        id: uid('v'),
        bmi: bmiOf(input.height, input.weight),
        recordedBy: input.recordedBy ?? 'زهرا موسوی',
        recordedAt: new Intl.DateTimeFormat('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      };
      setVitals((list) => [
        record,
        ...list.filter((v) => v.appointmentId !== input.appointmentId),
      ]);
      return record;
    },
    [],
  );

  const addVisit = useCallback((input: Omit<Visit, 'id' | 'status'>): Visit => {
    const visit: Visit = { ...input, id: uid('vis'), status: 'ثبت‌شده' };
    setVisits((list) => [visit, ...list]);
    return visit;
  }, []);

  const addPrescription = useCallback((input: Omit<Prescription, 'id' | 'code'>): Prescription => {
    const year = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date());
    const serial = String(Math.floor(100 + Math.random() * 900));
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const prescription: Prescription = {
      ...input,
      id: uid('rx'),
      code: `RX-${year}${month}${day}-${serial}`,
    };
    setPrescriptions((list) => [prescription, ...list]);
    return prescription;
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<OrderItem>) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const payInvoice = useCallback((id: string, method: NonNullable<Invoice['method']>) => {
    setInvoices((list) =>
      list.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              paidAmount: inv.patientShare,
              status: 'تسویه‌شده',
              method,
              cashier: 'محسن رستمی',
            }
          : inv,
      ),
    );
  }, []);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'no'>): Invoice => {
    const created: Invoice = {
      ...invoice,
      id: uid('inv'),
      no: `۱۴۰۵-${String(Math.floor(800 + Math.random() * 100))}`,
    };
    setInvoices((list) => [created, ...list]);
    return created;
  }, []);

  const submitInsuranceDoc = useCallback((id: string) => {
    setInsuranceDocs((list) =>
      list.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              status: 'ارسال‌شده',
              trackingCode: `SSO-${Math.floor(800_000 + Math.random() * 99_999)}`,
            }
          : doc,
      ),
    );
  }, []);

  const submitInsuranceDocs = useCallback((ids: string[]) => {
    setInsuranceDocs((list) =>
      list.map((doc) =>
        ids.includes(doc.id) && doc.status === 'پیش‌نویس'
          ? {
              ...doc,
              status: 'ارسال‌شده',
              trackingCode: `SSO-${Math.floor(800_000 + Math.random() * 99_999)}`,
            }
          : doc,
      ),
    );
  }, []);

  const updateTariff = useCallback((id: string, patch: Partial<Tariff>) => {
    setTariffs((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const addReferral = useCallback(
    (input: Omit<Referral, 'id' | 'date' | 'status'>): Referral => {
      const referral: Referral = { ...input, id: uid('ref'), date: isoDate(), status: 'در انتظار' };
      setReferrals((list) => [referral, ...list]);
      return referral;
    },
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark,
      user,
      page,
      setPage,
      focusPatientId,
      setFocusPatient,
      login,
      logout,
      switchRole,
      findUserByPhone,
      patients,
      appointments,
      vitals,
      visits,
      prescriptions,
      orders,
      invoices,
      insuranceDocs,
      tariffs,
      referrals,
      toasts,
      notify,
      dismissToast,
      addPatient,
      bookAppointment,
      updateAppointment,
      callNextPatient,
      saveVitals,
      addVisit,
      addPrescription,
      updateOrder,
      payInvoice,
      addInvoice,
      submitInsuranceDoc,
      submitInsuranceDocs,
      updateTariff,
      addReferral,
    }),
    [
      theme,
      setTheme,
      toggleTheme,
      isDark,
      user,
      page,
      focusPatientId,
      setFocusPatient,
      login,
      logout,
      switchRole,
      findUserByPhone,
      patients,
      appointments,
      vitals,
      visits,
      prescriptions,
      orders,
      invoices,
      insuranceDocs,
      tariffs,
      referrals,
      toasts,
      notify,
      dismissToast,
      addPatient,
      bookAppointment,
      updateAppointment,
      callNextPatient,
      saveVitals,
      addVisit,
      addPrescription,
      updateOrder,
      payInvoice,
      addInvoice,
      submitInsuranceDoc,
      submitInsuranceDocs,
      updateTariff,
      addReferral,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
