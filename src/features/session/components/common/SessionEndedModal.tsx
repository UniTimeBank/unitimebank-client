import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Coins, Star, Compass, UserCheck, CheckCircle2 } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { PostSessionRatingModal } from '@/features/moderation';
import { useGetMyRatedSessionsQuery } from '@/core/api/moderation';

export interface SessionEndedData {
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

export interface SessionEndedModalProps extends SessionEndedData {
  isOpen: boolean;
  onClose?: () => void;
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
  onClose,
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
  redirectUrl = '/explore',
}) => {
  const navigate = useNavigate();
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number>(5);
  const [hasRatedLocally, setHasRatedLocally] = useState(false);

  // Kiểm tra danh sách các session đã từng đánh giá từ server
  const { data: myRatedSessions } = useGetMyRatedSessionsQuery(undefined, {
    skip: !isOpen || isHost,
  });

  if (!isOpen) return null;

  const targetExploreUrl = redirectUrl || '/explore';

  const hasLocalStorageRating = Boolean(
    (roomId && localStorage.getItem(`rated_room_${roomId}`)) ||
      (bookingId && localStorage.getItem(`rated_booking_${bookingId}`)),
  );

  const hasAlreadyRated =
    hasRatedLocally ||
    hasLocalStorageRating ||
    Boolean(
      myRatedSessions?.some(
        (r) => (roomId && r.roomId === roomId) || (bookingId && r.bookingId === bookingId),
      ),
    );

  // Chỉ cho phép đánh giá nếu chưa từng đánh giá buổi học này
  const canRate = Boolean((bookingId || roomId) && mentorId && !isHost && !hasAlreadyRated);

  const handleStarClick = (starVal: number) => {
    setSelectedStar(starVal);
    setIsRatingOpen(true);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(targetExploreUrl);
    }
  };

  const handleNavigateExplore = () => {
    if (onClose) {
      onClose();
    }
    navigate(targetExploreUrl);
  };

  const modalTitle = title || (isHost ? 'Buổi học đã hoàn tất' : 'Buổi học đã kết thúc');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{modalTitle}</span>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {/* Header Role Badge & Description */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5">
              {isHost ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
                  Người hướng dẫn (Host)
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                  Học viên tham gia
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {description ||
                (isHost
                  ? 'Cảm ơn bạn đã cống hiến tri thức và đồng hành cùng cộng đồng sinh viên UniTime Bank.'
                  : 'Cảm ơn bạn đã tham gia buổi học và chia sẻ tri thức cùng cộng đồng UniTime Bank.')}
            </p>
          </div>

          {/* Mentor Profile Preview (Cho học viên) */}
          {!isHost && mentorName && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <div className="relative shrink-0">
                {mentorAvatar ? (
                  <img
                    src={mentorAvatar}
                    alt={mentorName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {mentorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 truncate">{mentorName}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                    <UserCheck className="w-2.5 h-2.5" />
                    Chủ phòng
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Người hướng dẫn buổi học</p>
              </div>
            </div>
          )}

          {/* Session Statistics Grid (2 Cột) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Thời gian */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Thời gian học</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                {durationFormatted}
              </p>
            </div>

            {/* Credit */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
                <Coins className="w-3.5 h-3.5 text-slate-400" />
                <span>{isHost ? 'Credit nhận được' : 'Credit sử dụng'}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p
                  className={`text-sm sm:text-base font-bold tracking-tight ${
                    isHost
                      ? 'text-emerald-600'
                      : creditsTransferred > 0
                      ? 'text-slate-800'
                      : 'text-slate-700'
                  }`}
                >
                  {isHost
                    ? `+${creditsTransferred}`
                    : creditsTransferred > 0
                    ? `-${creditsTransferred}`
                    : '0'}{' '}
                  <span className="text-[11px] font-normal text-slate-400">Credit</span>
                </p>
                {!isHost && creditsTransferred === 0 && sessionType === 'GROUP' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Miễn phí 5p
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Đã đánh giá xong trước đó */}
          {!isHost && hasAlreadyRated && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bạn đã gửi đánh giá cho buổi học này rồi.</span>
            </div>
          )}

          {/* Star Rating Card (Cho học viên nếu chưa đánh giá) */}
          {canRate && (
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 text-center">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Đánh giá người hướng dẫn
                </span>
                <span className="text-[11px] text-slate-500">
                  {STAR_TOOLTIPS[hoveredStar || selectedStar] || 'Rất hài lòng'}
                </span>
              </div>

              {/* 5 Stars */}
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
                      className="p-1 rounded-lg transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                      title={STAR_TOOLTIPS[starVal]}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400'
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
          <div className="space-y-2 pt-1">
            {canRate && (
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsRatingOpen(true)}
                className="w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
              >
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>Gửi đánh giá & nhận xét</span>
              </Button>
            )}

            <Button
              type="button"
              variant={canRate ? 'outline' : 'primary'}
              onClick={handleNavigateExplore}
              className="w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Khám phá các buổi học khác</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Post Session Rating Modal */}
      {canRate && mentorId && (
        <PostSessionRatingModal
          isOpen={isRatingOpen}
          onClose={() => {
            setIsRatingOpen(false);
            handleNavigateExplore();
          }}
          bookingId={bookingId}
          roomId={roomId}
          sessionType={sessionType}
          mentorId={mentorId}
          mentorName={mentorName}
          mentorAvatar={mentorAvatar}
          initialStars={selectedStar}
          onSuccess={() => {
            setHasRatedLocally(true);
            handleNavigateExplore();
          }}
        />
      )}
    </>
  );
};

export default SessionEndedModal;
