import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { BookingStatus, type BookingItem } from '@/core/api/booking/bookingApi';
import { Button, Modal, Radio } from '@/shared/components/ui';

export interface CancelBookingModalProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (bookingId: string, reason: string) => Promise<void>;
  isCancelling?: boolean;
  currentUserId?: string;
}

const CANCEL_REASONS = [
  'Bận lịch đột xuất',
  'Thay đổi kế hoạch học tập',
  'Không liên lạc được với đối tác',
  'Lý do khác',
];

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirmCancel,
  isCancelling = false,
  currentUserId,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(CANCEL_REASONS[0]);
      setCustomReason('');
    }
  }, [isOpen]);

  if (!booking) return null;

  // Determine if logged-in user is Mentor or Learner
  const isMentor = Boolean(currentUserId && booking.mentorId === currentUserId);
  const partnerRole = isMentor ? 'Học viên' : 'Người hướng dẫn';
  const partnerName = isMentor
    ? booking.learnerName || 'Học viên'
    : booking.mentorName || 'Người hướng dẫn';

  const scheduledDate = new Date(booking.scheduledStart);
  const scheduledTime = scheduledDate.getTime();
  const hoursUntilSession = (scheduledTime - Date.now()) / (1000 * 60 * 60);
  const isConfirmedBooking = booking.status === BookingStatus.CONFIRMED;
  const isLateCancel = isConfirmedBooking && hoursUntilSession < 2 && hoursUntilSession > 0;

  const lateFee10Percent = Math.round(booking.totalCreditEscrowed * 0.1);
  const learnerRefundAmount = Math.max(0, booking.totalCreditEscrowed - lateFee10Percent);

  const handleConfirm = async () => {
    const finalReason =
      selectedReason === 'Lý do khác' && customReason.trim()
        ? customReason.trim()
        : selectedReason;

    await onConfirmCancel(booking.id, finalReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận hủy lịch học"
      size="md"
    >
      <div className="space-y-5 pt-1">
        {/* Booking Short Info Card */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
          <div className="font-bold text-gray-900 text-sm">
            {booking.title || 'Buổi kèm học 1-1'}
          </div>
          <div className="text-gray-600 flex items-center gap-1">
            <span>{partnerRole}:</span>
            <strong className="text-gray-800 font-semibold">{partnerName}</strong>
          </div>
          <div className="text-gray-500 flex items-center gap-1.5 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {scheduledDate.toLocaleDateString('vi-VN')} •{' '}
              {scheduledDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Policy & Penalty Alerts — 100% Specific to Role and Timing */}
        {isLateCancel ? (
          /* TRƯỜNG HỢP 1: HỦY SÁT GIỜ (< 2 TIẾNG) */
          <div className="p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-900 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-xs text-red-900">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                {isMentor
                  ? 'Cảnh báo Người hướng dẫn hủy sát giờ (< 2 giờ)'
                  : 'Cảnh báo Học viên hủy sát giờ (< 2 giờ)'}
              </span>
            </div>

            {isMentor ? (
              <div className="text-xs text-red-800 space-y-1.5 leading-relaxed">
                <p>
                  Bạn đang yêu cầu hủy khi buổi học còn chưa đầy 2 tiếng. Theo quy chế của hệ thống:
                </p>
                <ul className="list-disc pl-4 space-y-1 font-medium">
                  <li>
                    Bạn sẽ <strong>bị trừ 10 Điểm Uy Tín (-10 Trust Score)</strong> do vi phạm cam kết đứng lớp.
                  </li>
                  <li>
                    Học viên (<strong>{partnerName}</strong>) sẽ được hoàn lại <strong>100% ({booking.totalCreditEscrowed} Credit)</strong>.
                  </li>
                </ul>
              </div>
            ) : (
              <div className="text-xs text-red-800 space-y-1.5 leading-relaxed">
                <p>
                  Bạn đang yêu cầu hủy khi buổi học còn chưa đầy 2 tiếng. Theo quy chế của hệ thống:
                </p>
                <ul className="list-disc pl-4 space-y-1 font-medium">
                  <li>
                    Bị trừ <strong>10% phí hủy ({lateFee10Percent} Credit)</strong> để đền bù thời gian chuẩn bị cho Người dạy (<strong>{partnerName}</strong>).
                  </li>
                  <li>
                    Bạn sẽ nhận lại <strong>90% ({learnerRefundAmount} Credit)</strong> về ví khả dụng.
                  </li>
                  <li>
                    Bạn <strong>không bị trừ Điểm Uy Tín</strong>.
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : isConfirmedBooking ? (
          /* TRƯỜNG HỢP 2: HỦY ĐÚNG HẠN (>= 2 TIẾNG TRƯỚC GIỜ HỌC) */
          <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isMentor
                  ? 'Chính sách hủy lịch dạy (Người hướng dẫn)'
                  : 'Chính sách hoàn tiền ký quỹ (Học viên)'}
              </span>
            </div>

            {isMentor ? (
              <div className="text-xs text-emerald-800 space-y-1 leading-relaxed">
                <p>
                  Bạn đang hủy trước giờ học trên 2 tiếng. Toàn bộ{' '}
                  <strong>{booking.totalCreditEscrowed} Credit</strong> ký quỹ sẽ được hoàn trả lại cho học viên (
                  <strong>{partnerName}</strong>).
                </p>
              </div>
            ) : (
              <div className="text-xs text-emerald-800 space-y-1 leading-relaxed">
                <p>
                  Bạn đang hủy trước giờ học trên 2 tiếng. Toàn bộ khoản ký quỹ{' '}
                  <strong>{booking.totalCreditEscrowed} Credit</strong> sẽ được hoàn trả 100% về ví khả dụng của bạn ngay lập tức.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* TRƯỜNG HỢP 3: YÊU CẦU ĐANG CHỜ DUYỆT (PENDING) */
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                {isMentor ? 'Từ chối yêu cầu đặt lịch' : 'Hủy yêu cầu đặt lịch'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isMentor
                ? `Bạn đang từ chối yêu cầu đặt lịch của học viên ${partnerName}. Việc này hoàn toàn miễn phí và không ảnh hưởng tới điểm uy tín của bạn.`
                : 'Yêu cầu đặt lịch này chưa được người hướng dẫn duyệt. Bạn có thể hủy miễn phí bất kỳ lúc nào mà không bị trừ Credit hay điểm uy tín.'}
            </p>
          </div>
        )}

        {/* Cancellation Reason Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800">
            Lý do hủy lịch học:
          </label>
          <div className="space-y-1.5">
            {CANCEL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <div
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/40 font-semibold text-primary-950 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <Radio
                    checked={isSelected}
                    onSelect={() => setSelectedReason(reason)}
                    name="cancelReason"
                    value={reason}
                  />
                  <span>{reason}</span>
                </div>
              );
            })}
          </div>

          {selectedReason === 'Lý do khác' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Nhập chi tiết lý do hủy của bạn..."
              rows={2}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all mt-2"
            />
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-xl border-gray-200 text-gray-700 text-xs font-semibold py-2 px-4 cursor-pointer"
          >
            Không hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            disabled={isCancelling}
            className="rounded-xl font-bold text-xs py-2 px-4 cursor-pointer transition-all"
          >
            {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy lịch'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
