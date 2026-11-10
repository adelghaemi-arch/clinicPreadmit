import type { ComponentType } from 'react';
import { ManagementDashboard } from './Dashboard';
import { DoctorsPage } from './Doctors';
import { ReportsPage } from './Reports';
import { TariffsPage } from './Tariffs';

export const managementPages: Record<string, ComponentType> = {
  dashboard: ManagementDashboard,
  doctors: DoctorsPage,
  reports: ReportsPage,
  tariffs: TariffsPage,
};
