import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Coins, Clock, ArrowRight, Star } from 'lucide-react';
import { PostSessionRatingModal } from '@/features/moderation';

interface SessionEndedModalProps {
  isOpen: boolean;
  creditsTransferred?: number;
  durationFormatted?: string;
  isHost?: boolean;
  bookingId?: string;
  roomId?: string;
  sessionType?: 'ONE_ON_ONE' | 'GROUP';
  mentorId?: string;
  mentorName?: string;
  mentorAvatar?: string;
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export const SessionEndedModal: React.FC<SessionEndedModalProps> = ({
  isOpen,
  creditsTransferred = 0,
  durationFormatted = '00:00',
  isHost = false,
  bookingId,
  roomId,
  sessionType = 'ONE_ON_ONE',
  mentorId,
  mentorName,
  mentorAvatar,
  title,
  description,
  redirectUrl,
}) => {
  const navigate = useNavigate();
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  if (!isOpen) return null;

  const defaultRedirect =
    redirectUrl || (sessionType === 'GROUP' ? '/manage/group-sessions' : '/manage/bookings');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-slate-100">{title || 'Buổi học đã kết thúc!'}</h3>
          <p className="text-sm text-slate-400 mt-2">
            {description || 'Cảm ơn bạn đã tham gia buổi học và chia sẻ tri thức cùng cộng đồng UniTimeBank.'}
          </p>

          {/* Stats */}
          <div className="my-6 grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thời gian học</span>
              </div>
              <p className="text-base font-bold text-slate-100">{durationFormatted}</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHost ? 'Credits nhận được' : 'Credits đã sử dụng'}</span>
              </div>
              <p className={`text-base font-bold ${isHost ? 'text-emerald-400' : creditsTransferred > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {isHost ? `+${creditsTransferred}` : creditsTransferred > 0 ? `-${creditsTransferred}` : '0'} Credits
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {(bookingId || roomId) && mentorId && !isHost && (
              <button
                type="button"
                onClick={() => setIsRatingOpen(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Đánh giá Người hướng dẫn</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(defaultRedirect)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Quay lại trang Quản lý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {(bookingId || roomId) && mentorId && (
        <PostSessionRatingModal
          isOpen={isRatingOpen}
          onClose={() => {
            setIsRatingOpen(false);
            navigate(defaultRedirect);
          }}
          bookingId={bookingId}
          roomId={roomId}
          sessionType={sessionType}
          mentorId={mentorId}
          mentorName={mentorName}
          mentorAvatar={mentorAvatar}
          onSuccess={() => {
            navigate(defaultRedirect);
          }}
        />
      )}
    </>
  );
};
