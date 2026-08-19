import type { DayOfWeek } from '../types';

/**
 * Format Date object sang chuỗi YYYY-MM-DD theo giờ Local (tránh lệch múi giờ UTC)
 */
export const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy ngày Thứ 2 đầu tuần của 1 ngày bất kỳ (định dạng YYYY-MM-DD chuẩn Local)
 */
export const getMondayOfWeek = (dateInput: Date | string): string => {
  const d =
    typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00`)
      : new Date(dateInput);
  const day = d.getDay(); // 0: SUN, 1: MON, 2: TUE, 3: WED, 4: THU, 5: FRI, 6: SAT
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return formatLocalDate(monday);
};

/**
 * Tính ngày kết thúc sau N ngày
 */
export const getEndDate = (startStr: string, days = 6): string => {
  const d = new Date(startStr.includes('T') ? startStr : `${startStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
};

export const ALL_WEEK_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/**
 * Chuyển đổi chuỗi "HH:mm" thành số phút trong ngày
 */
export const timeToMinutes = (t: string): number => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Chuyển đổi số phút trong ngày thành chuỗi "HH:mm"
 */
export const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Tìm khung giờ trống đầu tiên không trùng lặp trên một Thứ cụ thể (Lịch tuần lặp lại)
 */
export const findFirstAvailableSlotOnDay = (
  day: DayOfWeek,
  list: Array<{ dayOfWeek: DayOfWeek; startTime: string; endTime: string; isActive?: boolean }>,
  preferStartFrom = '08:00',
  durationMinutes = 60,
): { startTime: string; endTime: string } | null => {
  const occupied = list
    .filter((s) => s.dayOfWeek === day && (s.isActive ?? true))
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));

  // 1. Quét từ preferStartFrom trở đi đến tối
  let startM = timeToMinutes(preferStartFrom);
  while (startM + durationMinutes <= 23 * 60 + 45) {
    const endM = startM + durationMinutes;
    const sStr = minutesToTime(startM);
    const eStr = minutesToTime(endM);

    const isOverlap = occupied.some((occ) => sStr < occ.endTime && occ.startTime < eStr);
    if (!isOverlap) {
      return { startTime: sStr, endTime: eStr };
    }
    startM += 15;
  }

  // 2. Quét từ 07:00 sáng đến preferStartFrom
  startM = 7 * 60;
  const preferM = timeToMinutes(preferStartFrom);
  while (startM + durationMinutes <= preferM) {
    const endM = startM + durationMinutes;
    const sStr = minutesToTime(startM);
    const eStr = minutesToTime(endM);

    const isOverlap = occupied.some((occ) => sStr < occ.endTime && occ.startTime < eStr);
    if (!isOverlap) {
      return { startTime: sStr, endTime: eStr };
    }
    startM += 15;
  }

  return null;
};

/**
 * Tìm Thứ và khung giờ trống đầu tiên trong tuần
 */
export const findNextAvailableDayAndSlot = (
  startDay: DayOfWeek,
  list: Array<{ dayOfWeek: DayOfWeek; startTime: string; endTime: string; isActive?: boolean }>,
  preferStartFrom = '08:00',
  durationMinutes = 60,
): { day: DayOfWeek; startTime: string; endTime: string } => {
  const slotOnCurrentDay = findFirstAvailableSlotOnDay(
    startDay,
    list,
    preferStartFrom,
    durationMinutes,
  );
  if (slotOnCurrentDay) {
    return {
      day: startDay,
      startTime: slotOnCurrentDay.startTime,
      endTime: slotOnCurrentDay.endTime,
    };
  }

  const startIndex = ALL_WEEK_DAYS.indexOf(startDay);
  const otherDays = [
    ...ALL_WEEK_DAYS.slice(startIndex + 1),
    ...ALL_WEEK_DAYS.slice(0, startIndex),
  ];

  for (const day of otherDays) {
    const slot = findFirstAvailableSlotOnDay(day, list, '08:00', durationMinutes);
    if (slot) {
      return { day, startTime: slot.startTime, endTime: slot.endTime };
    }
  }

  return { day: startDay, startTime: '08:00', endTime: '09:00' };
};

/**
 * Tìm khung giờ trống đầu tiên không trùng lặp trên một Ngày cụ thể (Lịch đặc biệt / Ngoại lệ)
 */
export const findFirstAvailableSlotOnDate = (
  dateStr: string,
  exceptions: Array<{ exceptionDate: string; startTime: string; endTime: string; [key: string]: any }>,
  preferStartFrom = '08:00',
  durationMinutes = 60,
): { startTime: string; endTime: string } => {
  const occupied = exceptions
    .filter((s) => s.exceptionDate === dateStr)
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));

  // 1. Quét từ preferStartFrom trở đi
  let startM = timeToMinutes(preferStartFrom);
  while (startM + durationMinutes <= 23 * 60 + 45) {
    const endM = startM + durationMinutes;
    const sStr = minutesToTime(startM);
    const eStr = minutesToTime(endM);

    const isOverlap = occupied.some((occ) => sStr < occ.endTime && occ.startTime < eStr);
    if (!isOverlap) {
      return { startTime: sStr, endTime: eStr };
    }
    startM += 15;
  }

  // 2. Quét từ 07:00 sáng
  startM = 7 * 60;
  const preferM = timeToMinutes(preferStartFrom);
  while (startM + durationMinutes <= preferM) {
    const endM = startM + durationMinutes;
    const sStr = minutesToTime(startM);
    const eStr = minutesToTime(endM);

    const isOverlap = occupied.some((occ) => sStr < occ.endTime && occ.startTime < eStr);
    if (!isOverlap) {
      return { startTime: sStr, endTime: eStr };
    }
    startM += 15;
  }

  return { startTime: '08:00', endTime: '09:00' };
};
