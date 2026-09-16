import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Coins, Clock, ArrowRight, Star, User, ShieldCheck } from 'lucide-react';
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

const STAR_TOOLTIPS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời & Rất hài lòng',
};

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
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number>(5);

  if (!isOpen) return null;

  const defaultRedirect =
    redirectUrl || (sessionType === 'GROUP' ? '/manage/group-sessions' : '/manage/bookings');

  const canRate = (bookingId || roomId) && mentorId && !isHost;

  const handleStarClick = (starVal: number) => {
    setSelectedStar(starVal);
    setIsRatingOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-[450px] bg-white border border-slate-100 rounded-[28px] p-6 sm:p-7 text-center shadow-2xl shadow-slate-900/15 relative overflow-hidden">
          {/* Top Decorative Ambient Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-b from-primary-100/70 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          {/* Hero Celebration Icon Badge */}
          <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-emerald-100/70 rotate-6 transition-transform duration-300 hover:rotate-12" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-primary-600 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center border-2 border-white shadow-xs">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
            </div>
          </div>

          {/* Role Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border shadow-2xs">
            {isHost ? (
              <span className="bg-emerald-50 text-emerald-700 border-emerald-200/80">
                👨‍🏫 Người hướng dẫn (Host)
              </span>
            ) : (
              <span className="bg-primary-50 text-primary-700 border-primary-200/80">
                🎓 Học viên tham gia
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {title || 'Buổi học đã hoàn tất!'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-medium px-2">
            {description ||
              (isHost
                ? 'Cảm ơn bạn đã cống hiến tri thức và đồng hành cùng cộng đồng sinh viên UniTime Bank.'
                : 'Cảm ơn bạn đã tham gia buổi học và chia sẻ tri thức cùng cộng đồng UniTime Bank.')}
          </p>

          {/* Mentor Profile Preview Card (For Learners) */}
          {canRate && mentorName && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-left mt-4 mb-2 shadow-2xs">
              <div className="relative shrink-0">
                {mentorAvatar ? (
                  <img
                    src={mentorAvatar}
                    alt={mentorName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold text-sm flex items-center justify-center border border-primary-200 shadow-xs">
                    {mentorName.substring(0, 1).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                )}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 truncate">{mentorName}</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Chủ phòng
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Người hướng dẫn buổi học</p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="my-4 grid grid-cols-2 gap-3">
            {/* 1. Duration */}
            <div className="bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-left transition-all">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <div className="w-5 h-5 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                  <Clock className="w-3 h-3" />
                </div>
                <span>Thời gian học</span>
              </div>
              <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {durationFormatted}
              </p>
            </div>

            {/* 2. Credits */}
            <div className="bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-left transition-all">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Coins className="w-3 h-3" />
                </div>
                <span>{isHost ? 'Credit nhận được' : 'Credits sử dụng'}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    isHost
                      ? 'text-emerald-600'
                      : creditsTransferred > 0
                      ? 'text-slate-900'
                      : 'text-slate-700'
                  }`}
                >
                  {isHost
                    ? `+${creditsTransferred}`
                    : creditsTransferred > 0
                    ? `-${creditsTransferred}`
                    : '0'}{' '}
                  <span className="text-xs font-bold text-slate-400">Credit</span>
                </p>
                {!isHost && creditsTransferred === 0 && sessionType === 'GROUP' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                    Miễn phí 5p
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Star Rating Callout for Learners */}
          {canRate && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-center mb-4 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Đánh giá Người hướng dẫn
                </span>
                <span className="text-[11px] font-semibold text-amber-700">
                  {STAR_TOOLTIPS[hoveredStar || selectedStar] || 'Rất hài lòng'}
                </span>
              </div>

              {/* 5 Star Interactive Buttons */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= (hoveredStar || selectedStar);
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoveredStar(starVal)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => handleStarClick(starVal)}
                      className="p-1 rounded-lg transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-hidden"
                      title={STAR_TOOLTIPS[starVal]}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-300 fill-slate-100 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {canRate && (
              <button
                type="button"
                onClick={() => setIsRatingOpen(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99]"
              >
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Gửi đánh giá & nhận xét</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(defaultRedirect)}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99] ${
                canRate
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                  : 'bg-primary-700 hover:bg-primary-800 text-white shadow-md shadow-primary-700/25'
              }`}
            >
              <span>Quay lại trang quản lý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {canRate && (
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
          initialStars={selectedStar}
          onSuccess={() => {
            navigate(defaultRedirect);
          }}
        />
      )}
    </>
  );
};
export default SessionEndedModal;
