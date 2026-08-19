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

export const JS_DAY_TO_SLOT_DAY: Record<number, string> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

export const JS_DAY_TO_SHORT_DAY: Record<number, string> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

export const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

