/**
 * Chuyển đổi timestamp / ISO string / Date thành dạng "vừa xong", "x phút trước", "x giờ trước", "x ngày trước"...
 */
export const formatTimeAgo = (
  dateInput?: string | Date,
  fallback: string = 'Vừa xong',
): string => {
  if (!dateInput) return fallback;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return fallback;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Định dạng Date thành chuỗi YYYY-MM-DD theo giờ địa phương (tránh lệch timezone UTC)
 */
export const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Định dạng ngày theo chuẩn Việt Nam (DD/MM/YYYY)
 */
export const formatDateVN = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  const date = parseUtcDate(dateInput);
  if (isNaN(date.getTime())) return '';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Chuyển đổi timestamp / ISO string / Date thành Date chính xác theo múi giờ địa phương
 * Tự động gắn thêm Z nếu chuỗi từ backend (PostgreSQL) thiếu múi giờ UTC
 */
export const parseUtcDate = (dateInput?: string | Date | number): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'number') return new Date(dateInput);
  let str = String(dateInput).trim();
  str = str.replace(' ', 'T');
  // Nếu chuỗi ISO chưa có định danh múi giờ (+HH:MM, -HH:MM hoặc Z), gắn Z để parse chuẩn UTC
  if (!str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str += 'Z';
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date(dateInput) : parsed;
};

