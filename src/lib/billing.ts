import type { Doctor, InsuranceKind, Invoice, Patient } from '../types';
import { todayIso } from './utils';

export const insuranceCoverage: Record<InsuranceKind, number> = {
  'تأمین اجتماعی': 70,
  'بیمه سلامت': 60,
  'نیروهای مسلح': 80,
  آزاد: 0,
};

export interface FeeSplit {
  insuranceShare: number;
  supplementaryShare: number;
  patientShare: number;
}

export function splitFee(fee: number, patient: Patient): FeeSplit {
  const coverage = insuranceCoverage[patient.insurance] ?? 0;
  const insuranceShare = Math.round((fee * coverage) / 100);
  const remaining = fee - insuranceShare;
  const hasSupplementary = Boolean(patient.supplementary) && patient.supplementary !== '—';
  const supplementaryShare = hasSupplementary ? Math.round(remaining * 0.5) : 0;
  return {
    insuranceShare,
    supplementaryShare,
    patientShare: remaining - supplementaryShare,
  };
}

export function buildVisitInvoice(
  doctor: Doctor,
  patient: Patient,
  date: string = todayIso(),
): Omit<Invoice, 'id' | 'no'> {
  const split = splitFee(doctor.visitFee, patient);
  return {
    patientId: patient.id,
    doctorId: doctor.id,
    date,
    items: [{ title: `ویزیت تخصصی ${doctor.specialty}`, qty: 1, unit: doctor.visitFee }],
    ...split,
    paidAmount: 0,
    status: 'پرداخت‌نشده',
  };
}
