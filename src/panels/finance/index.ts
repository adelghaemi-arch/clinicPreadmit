import type { ComponentType } from 'react';
import { FinanceCashier } from './Cashier';
import { FinanceInsurance } from './Insurance';
import { FinanceReports } from './Reports';

export const financePages: Record<string, ComponentType> = {
  cashier: FinanceCashier,
  insurance: FinanceInsurance,
  reports: FinanceReports,
};
