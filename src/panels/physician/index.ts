import type { ComponentType } from 'react';
import { PhysicianAppointments } from './Appointments';
import { EHRPage } from './EHR';
import { VisitPage } from './Visit';
import { PrescriptionPage } from './Prescription';

export const physicianPages: Record<string, ComponentType> = {
  appointments: PhysicianAppointments,
  ehr: EHRPage,
  visit: VisitPage,
  prescription: PrescriptionPage,
};
