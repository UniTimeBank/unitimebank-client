/**
 * Kiểm tra xem buổi học 1:1 đã mở để tham gia hay chưa.
 * Điều kiện mở:
 * - Trạng thái là CONFIRMED hoặc STARTED
 * - Thời gian hiện tại: Trong khoảng từ (scheduledStart - 10 phút) đến (scheduledEnd)
 */
export const checkBookingSessionJoinable = (booking?: {
  status?: string;
  scheduledStart?: string | Date;
  scheduledEnd?: string | Date;
}): boolean => {
  if (!booking || (booking.status !== 'CONFIRMED' && booking.status !== 'STARTED')) {
    return false;
  }

  if (!booking.scheduledStart || !booking.scheduledEnd) {
    return true;
  }

  const now = Date.now();
  const startTime = new Date(booking.scheduledStart).getTime();
  const endTime = new Date(booking.scheduledEnd).getTime();

  // Cho phép vào trước giờ học 10 phút
  const openTime = startTime - 10 * 60 * 1000;

  return now >= openTime && now <= endTime;
};
