import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Lock } from 'lucide-react';
import { Button } from '@/shared/components/ui';

interface BookingActionButtonProps {
  isOwner: boolean;
  isClosed: boolean;
  selectedSlot: { startTime: string; endTime: string } | null;
  isInsufficientCredit: boolean;
  primaryButtonText: string;
  onBooking: () => void;
}

export const BookingActionButton: React.FC<BookingActionButtonProps> = ({
  isOwner,
  isClosed,
  selectedSlot,
  isInsufficientCredit,
  primaryButtonText,
  onBooking,
}) => {
  return (
    <div className="pt-2">
      {isOwner ? (
        <Link to="/manage/posts" className="block w-full">
          <Button
            type="button"
            variant="outline"
            fullWidth
            size="md"
            className="rounded-xl border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs py-3 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Quản lý bài đăng của bạn</span>
          </Button>
        </Link>
      ) : isClosed ? (
        <div className="space-y-1.5">
          <Button
            type="button"
            variant="outline"
            fullWidth
            size="md"
            disabled
            className="rounded-xl border-amber-200 bg-amber-50/80 text-amber-800 font-bold text-xs py-3 flex items-center justify-center gap-1.5 shadow-2xs opacity-90 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Bài dạy đã tạm đóng</span>
          </Button>
          <p className="text-[11px] text-amber-700 font-medium text-center">
            Người hướng dẫn hiện đang tạm ngưng nhận học viên mới.
          </p>
        </div>
      ) : (
        <Button
          type="button"
          variant="primary"
          fullWidth
          size="md"
          disabled={!selectedSlot || isInsufficientCredit}
          onClick={onBooking}
          className="rounded-xl bg-primary-700 hover:bg-primary-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs py-3 shadow-xs cursor-pointer"
        >
          <span>{isInsufficientCredit ? 'Số dư không đủ' : primaryButtonText}</span>
        </Button>
      )}
    </div>
  );
};
