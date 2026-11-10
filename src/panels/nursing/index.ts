import type { ComponentType } from 'react';
import { NursingTriage } from './Triage';
import { NursingServices } from './Services';
import { NursingEmergency } from './Emergency';

export const nursingPages: Record<string, ComponentType> = {
  triage: NursingTriage,
  services: NursingServices,
  emergency: NursingEmergency,
};
