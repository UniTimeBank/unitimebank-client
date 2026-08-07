export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ExceptionType = 'EXTRA' | 'BLOCKED';

export interface DayOption {
  value: DayOfWeek;
  shortLabel: string;
  label: string;
}

export interface CreateRecurringScheduleDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface UpdateRecurringScheduleDto {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export interface RecurringSchedule {
  id: string;
  mentorId?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CopyScheduleSource {
  day: DayOfWeek;
  label: string;
  slots: RecurringSchedule[];
}

export interface CreateScheduleExceptionDto {
  exceptionDate: string;
  type: ExceptionType;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface ScheduleException {
  id: string;
  mentorId?: string;
  exceptionDate: string;
  type: ExceptionType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  reason?: string;
  createdAt: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  source: 'RECURRING' | 'EXTRA';
  recurringScheduleId?: string;
  exceptionId?: string;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: string;
  slots: AvailabilitySlot[];
}

export interface GetAvailabilityParams {
  mentorId?: string;
  userId?: string;
  from: string;
  to: string;
}
