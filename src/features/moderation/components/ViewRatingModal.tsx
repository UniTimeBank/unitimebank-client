import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, MessageSquareQuote, Calendar, Sparkles, User, GraduationCap, Users } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import type { RatingItem } from '../types';
import LogoImage from '@/assets/images/Logo.png';

export interface ViewRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating: RatingItem | null;
  /**
   * 'GIVEN': The current user gave this review to a mentor/host
   * 'RECEIVED': The current user received this review from a learner
   */
  mode?: 'GIVEN' | 'RECEIVED';
  fallbackPartnerName?: string;
  fallbackPartnerAvatar?: string;
  fallbackPartnerId?: string;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Rất hài lòng',
};

export const ViewRatingModal: React.FC<ViewRatingModalProps> = ({
  isOpen,
  onClose,
  rating,
  mode = 'GIVEN',
  fallbackPartnerName,
  fallbackPartnerAvatar,
  fallbackPartnerId,
}) => {
  if (!rating) return null;

  const stars = Math.max(1, Math.min(5, Math.round(rating.stars || 5)));
  const starLabel = STAR_LABELS[stars] || 'Hài lòng';

  // Parse tags from comment if enclosed in [tag]
  const rawComment = rating.comment || '';
  const tagMatches = rawComment.match(/\[(.*?)\]/g) || [];
  const tags = tagMatches.map((t) => t.slice(1, -1).trim()).filter(Boolean);
  const cleanComment = rawComment.replace(/\[(.*?)\]/g, '').trim();

  const isGiven = mode === 'GIVEN';
  let partnerName = isGiven
    ? rating.mentorName || fallbackPartnerName || 'Người hướng dẫn'
    : rating.reviewerName || fallbackPartnerName || 'Học viên';

  if (isGiven && (partnerName === 'Người hướng dẫn' || partnerName === 'Thành viên') && fallbackPartnerName) {
    partnerName = fallbackPartnerName;
  }
  if (!isGiven && (partnerName === 'Học viên' || partnerName === 'Thành viên') && fallbackPartnerName) {
    partnerName = fallbackPartnerName;
  }

  const partnerUserId = isGiven
    ? rating.mentorId || fallbackPartnerId
    : rating.learnerId || fallbackPartnerId;

  const partnerAvatar = isGiven
    ? rating.mentorAvatar || fallbackPartnerAvatar || ''
    : rating.reviewerAvatar || fallbackPartnerAvatar || '';

  const initials = partnerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase() || 'ND';

  const sessionTypeLabel =
    rating.sessionType === 'GROUP' || Boolean(rating.roomId)
      ? 'Học nhóm trực tuyến'
      : 'Buổi học kèm 1:1';

  const formattedDate = rating.submittedAt
    ? new Date(rating.submittedAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGiven ? 'Chi tiết đánh giá đã gửi' : 'Chi tiết đánh giá nhận được'}
      size="md"
    >
      <div className="space-y-5 py-1">
        {/* Partner / Session Header */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          {partnerUserId ? (
            <Link
              to={`/profile/${partnerUserId}`}
              onClick={onClose}
              className="shrink-0 group/partner cursor-pointer"
              title={`Xem hồ sơ của ${partnerName}`}
            >
              {partnerAvatar ? (
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover/partner:ring-2 group-hover/partner:ring-primary-400 transition-all shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-extrabold text-sm flex items-center justify-center border border-primary-200 group-hover/partner:ring-2 group-hover/partner:ring-primary-400 transition-all select-none shadow-2xs">
                  {initials}
                </div>
              )}
            </Link>
          ) : (
            partnerAvatar ? (
              <img
                src={partnerAvatar}
                alt={partnerName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-extrabold text-sm flex items-center justify-center border border-primary-200 shrink-0 select-none shadow-2xs">
                {initials}
              </div>
            )
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-500">
                {isGiven ? 'Người hướng dẫn:' : 'Học viên đánh giá:'}
              </span>
              <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/80">
                {sessionTypeLabel}
              </span>
            </div>
            {partnerUserId ? (
              <Link
                to={`/profile/${partnerUserId}`}
                onClick={onClose}
                className="text-sm font-bold text-slate-900 hover:text-primary-600 hover:underline truncate mt-0.5 block transition-colors cursor-pointer"
                title={`Xem hồ sơ của ${partnerName}`}
              >
                {partnerName}
              </Link>
            ) : (
              <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {partnerName}
              </h4>
            )}
          </div>
        </div>

        {/* Stars Display & Qualitative Label */}
        <div className="text-center py-4 px-4 bg-gradient-to-b from-amber-50/60 to-transparent rounded-2xl border border-amber-100/80 space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 ${
                  s <= stars
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {stars}/5 Sao — {starLabel}
            </span>
          </div>
        </div>

        {/* Feedback Tags if any */}
        {tags.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Điểm nổi bật được ghi nhận
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Feedback Comment */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
            <span>Nội dung nhận xét</span>
          </span>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {cleanComment ? (
              <p className="whitespace-pre-line italic text-slate-800">"{cleanComment}"</p>
            ) : (
              <p className="text-slate-400 italic">Không có nhận xét chi tiết đính kèm.</p>
            )}
          </div>
        </div>

        {/* Submission Date */}
        {formattedDate && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Thời gian gửi đánh giá</span>
            </span>
            <span className="font-semibold text-slate-600">{formattedDate}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-xl py-2.5 font-bold text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-0 cursor-pointer shadow-2xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
