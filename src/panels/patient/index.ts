import type { ComponentType } from 'react';
import { PatientBook } from './Book';
import { PatientRecords } from './Records';
import { PatientPrescriptions } from './Prescriptions';
import { PatientPayments } from './Payments';

export const patientPages: Record<string, ComponentType> = {
  book: PatientBook,
  records: PatientRecords,
  prescriptions: PatientPrescriptions,
  payments: PatientPayments,
};
