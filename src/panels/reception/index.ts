import type { ComponentType } from 'react';
import { ReceptionPatients } from './Patients';
import { ReceptionScheduling } from './Scheduling';
import { ReceptionAdmission } from './Admission';
import { ReceptionQueue } from './Queue';

export const receptionPages: Record<string, ComponentType> = {
  patients: ReceptionPatients,
  scheduling: ReceptionScheduling,
  admission: ReceptionAdmission,
  queue: ReceptionQueue,
};
