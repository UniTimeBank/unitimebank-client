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
  const d = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00`) : new Date(dateInput);
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

export const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
