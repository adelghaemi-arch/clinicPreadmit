import type { ComponentType } from 'react';
import type { RoleId } from '../types';
import { managementPages } from './management';
import { physicianPages } from './physician';
import { receptionPages } from './reception';
import { nursingPages } from './nursing';
import { financePages } from './finance';
import { patientPages } from './patient';

export const panelPages: Record<RoleId, Record<string, ComponentType>> = {
  management: managementPages,
  physician: physicianPages,
  reception: receptionPages,
  nursing: nursingPages,
  finance: financePages,
  patient: patientPages,
};
