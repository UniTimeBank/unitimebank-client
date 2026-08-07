import type { DayOption } from '../types';

export const DAYS_ROW_1: DayOption[] = [
  { value: 'MON', shortLabel: 'T2', label: 'Thứ Hai' },
  { value: 'TUE', shortLabel: 'T3', label: 'Thứ Ba' },
  { value: 'WED', shortLabel: 'T4', label: 'Thứ Tư' },
  { value: 'THU', shortLabel: 'T5', label: 'Thứ Năm' },
  { value: 'FRI', shortLabel: 'T6', label: 'Thứ Sáu' },
  { value: 'SAT', shortLabel: 'T7', label: 'Thứ Bảy' },
];

export const DAYS_ROW_2: DayOption[] = [
  { value: 'SUN', shortLabel: 'CN', label: 'Chủ Nhật' },
];

export const ALL_DAYS: DayOption[] = [...DAYS_ROW_1, ...DAYS_ROW_2];

export const WEEKDAY_VALUES = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
