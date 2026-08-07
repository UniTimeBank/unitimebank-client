/**
 * Lấy ngày Thứ 2 đầu tuần của 1 ngày bất kỳ (định dạng YYYY-MM-DD)
 */
export const getMondayOfWeek = (dateInput: Date | string): string => {
  const d = new Date(dateInput);
  const day = d.getDay(); // 0: SUN, 1: MON...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

/**
 * Tính ngày kết thúc sau N ngày
 */
export const getEndDate = (startStr: string, days = 6): string => {
  const d = new Date(startStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
