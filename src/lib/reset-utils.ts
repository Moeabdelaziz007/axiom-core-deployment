// Axiom RESET Utility Functions

import { TaskStatus, SectorType, Language } from '@/types/reset';

export const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: Date, locale: Language = 'en'): string => {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (date: Date, locale: Language = 'en'): string => {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTaskStatus = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status];
};

export const formatSectorName = (sector: SectorType): string => {
  const sectorMap: Record<SectorType, string> = {
    juice_shop: 'Juice Shop',
    mobile_repair: 'Mobile Repair',
    pharmacy: 'Pharmacy',
    general_retail: 'General Retail',
    food_service: 'Food Service',
  };
  return sectorMap[sector];
};