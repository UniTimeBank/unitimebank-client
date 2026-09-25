import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquareQuote,
  Loader2,
  Sparkles,
  Send,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Filter,
  Eye,
} from 'lucide-react';
import { useGetReviewsByUserQuery, useGetMyRatedSessionsQuery } from '@/core/api/moderation';
import { ViewRatingModal } from '@/features/moderation';
import type { RatingItem } from '@/features/moderation/types';
import LogoImage from '@/assets/images/Logo.png';

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  initials: string;
  avatarBg: string;
  date: string;
  content: string;
  stars?: number;
}

interface PeerReviewsSectionProps {
  userId?: string;
  reviews?: Review[];
  persona?: 'MENTOR' | 'LEARNER';
  isOwnProfile?: boolean;
}

const BG_COLORS = [
  'bg-amber-100 text-amber-800',
  'bg-primary-100 text-primary-800',
  'bg-emerald-100 text-emerald-800',
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
];

interface ReviewAvatarProps {
  src?: string;
  name: string;
  bgClass: string;
  userId?: string;
}

const ReviewAvatar: React.FC<ReviewAvatarProps> = ({ src, name, bgClass, userId }) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase() || 'U';
  }, [name]);

  const avatarElement = (src && src.trim() !== '' && !hasError) ? (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0 shadow-2xs group-hover/user:ring-2 group-hover/user:ring-primary-300 transition-all"
    />
  ) : (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${bgClass} shrink-0 border border-black/5 select-none shadow-2xs group-hover/user:ring-2 group-hover/user:ring-primary-300 transition-all`}
    >
      {initials}
    </div>
  );

  if (userId) {
    return (
      <Link
        to={`/profile/${userId}`}
        className="shrink-0 group/user cursor-pointer"
        title={`Xem hồ sơ của ${name}`}
      >
        {avatarElement}
      </Link>
    );
  }

  return avatarElement;
};

export const PeerReviewsSection: React.FC<PeerReviewsSectionProps> = ({
  userId,
  reviews: externalReviews,
  persona = 'MENTOR',
  isOwnProfile = true,
}) => {
  const [activeTab, setActiveTab] = useState<'RECEIVED' | 'GIVEN'>('RECEIVED');
  const [starFilter, setStarFilter] = useState<number | 'ALL'>('ALL');
  const [selectedRatingDetail, setSelectedRatingDetail] = useState<{
    rating: RatingItem;
    mode: 'GIVEN' | 'RECEIVED';
  } | null>(null);

  // 1. Fetch Received Reviews (Mentor mode)
  const { data: reviewsData, isLoading: isReceivedLoading } = useGetReviewsByUserQuery(
    { userId: userId || '', page: 1, limit: 50 },
    { skip: !userId },
  );

  // 2. Fetch Given Reviews (Learner mode)
  const { data: myGivenRatings = [], isLoading: isGivenLoading } = useGetMyRatedSessionsQuery(
    undefined,
    { skip: !isOwnProfile },
  );

  const receivedRatings = useMemo(() => reviewsData?.reviews || [], [reviewsData]);

  // Star Distribution
  const starDist = reviewsData?.starDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalReceived = reviewsData?.totalReviews ?? receivedRatings.length;
  const averageRating = reviewsData?.averageRating ?? 0;

  // Filtered received ratings
  const filteredReceived = useMemo(() => {
    if (starFilter === 'ALL') return receivedRatings;
    return receivedRatings.filter((r) => Math.round(r.stars) === starFilter);
  }, [receivedRatings, starFilter]);

  // Filtered given ratings
  const filteredGiven = useMemo(() => {
    if (starFilter === 'ALL') return myGivenRatings;
    return myGivenRatings.filter((r) => Math.round(r.stars) === starFilter);
  }, [myGivenRatings, starFilter]);

  // Parse tags helper
  const parseTags = (comment?: string) => {
    if (!comment) return { tags: [], cleanComment: '' };
    const matches = comment.match(/\[(.*?)\]/g) || [];
    const tags = matches.map((m) => m.slice(1, -1).trim()).filter(Boolean);
    const cleanComment = comment.replace(/\[(.*?)\]/g, '').trim();
    return { tags, cleanComment };
  };

  return (
    <div id="reviews-section" className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER & SUB-TABS (RECEIVED vs GIVEN) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-primary-600 shrink-0" />
            <span>Đánh giá & Phản hồi chất lượng</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Xem lại chi tiết phản hồi đánh giá và xếp hạng sao từ các buổi học.
          </p>
        </div>

        {/* Tab switch only when viewing own profile */}
        {isOwnProfile && (
          <div className="flex items-center p-1 bg-gray-100/90 rounded-2xl gap-1 border border-gray-200/60 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('RECEIVED');
                setStarFilter('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'RECEIVED'
                  ? 'bg-white text-gray-900 shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-primary-600" />
              <span>Đánh giá nhận được ({totalReceived})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('GIVEN');
                setStarFilter('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'GIVEN'
                  ? 'bg-white text-gray-900 shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Đã gửi ({myGivenRatings.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. SUMMARY & STAR BREAKDOWN BAR (For Received Reviews) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'RECEIVED' && totalReceived > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
          {/* Average Score Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {averageRating.toFixed(1)}
              <span className="text-sm font-semibold text-slate-400">/5</span>
            </span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Dựa trên <strong>{totalReceived}</strong> lượt đánh giá
            </p>
          </div>

          {/* Star Distribution Breakdown */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2">
            {[5, 4, 3, 2, 1].map((s) => {
              const count = starDist[s as keyof typeof starDist] || 0;
              const percent = totalReceived > 0 ? Math.round((count / totalReceived) * 100) : 0;
              const isSelected = starFilter === s;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStarFilter(isSelected ? 'ALL' : s)}
                  className={`flex items-center gap-2.5 text-xs font-semibold w-full text-left py-1 px-2 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'bg-primary-50 text-primary-900 ring-1 ring-primary-200' : 'hover:bg-slate-100/80 text-slate-600'
                  }`}
                >
                  <span className="w-8 shrink-0 flex items-center gap-0.5">
                    <span>{s}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        s >= 4 ? 'bg-amber-400' : s === 3 ? 'bg-amber-300' : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-400 text-[11px] shrink-0 font-normal">
                    {count} ({percent}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 3. STAR FILTER BADGES */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-gray-400 text-[11px] font-bold flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" />
          <span>Lọc theo sao:</span>
        </span>
        <button
          type="button"
          onClick={() => setStarFilter('ALL')}
          className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
            starFilter === 'ALL'
              ? 'bg-primary-600 text-white shadow-2xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStarFilter(s)}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              starFilter === s
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{s}</span>
            <Star className={`w-3 h-3 ${starFilter === s ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 4. CONTENT LIST */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isReceivedLoading || isGivenLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-medium">Đang tải đánh giá...</span>
        </div>
      ) : activeTab === 'RECEIVED' ? (
        /* RECEIVED TAB */
        filteredReceived.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Sparkles className="w-7 h-7 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700">
              {starFilter === 'ALL'
                ? 'Chưa có đánh giá nào được ghi nhận'
                : `Không có đánh giá nào đạt ${starFilter} sao`}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Đánh giá từ người học sẽ tự động xuất hiện tại đây sau khi hoàn thành các buổi học.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReceived.map((r, idx) => {
              const author = r.reviewerName || 'Học viên UniTime';
              const avatarBg = BG_COLORS[idx % BG_COLORS.length];
              const date = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('vi-VN') : '';
              const { tags, cleanComment } = parseTags(r.comment);

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/40 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ReviewAvatar
                        src={r.reviewerAvatar}
                        name={author}
                        bgClass={avatarBg}
                        userId={r.learnerId}
                      />
                      <div>
                        {r.learnerId ? (
                          <Link
                            to={`/profile/${r.learnerId}`}
                            className="text-xs font-bold text-gray-900 hover:text-primary-600 hover:underline block leading-tight transition-colors cursor-pointer"
                            title={`Xem hồ sơ của ${author}`}
                          >
                            {author}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-gray-900 block leading-tight">
                            {author}
                          </span>
                        )}
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= r.stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-bold text-slate-600 ml-1">
                            {r.stars}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 font-medium">{date}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedRatingDetail({ rating: r, mode: 'RECEIVED' })}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Feedback Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-11">
                      {tags.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Feedback Content */}
                  <p className="text-xs text-gray-600 leading-relaxed pl-11 italic">
                    "{cleanComment || 'Buổi học rất bổ ích và chất lượng!'}"
                  </p>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* GIVEN TAB (Ratings I submitted) */
        filteredGiven.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Send className="w-7 h-7 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-700">
              {starFilter === 'ALL'
                ? 'Bạn chưa gửi đánh giá nào'
                : `Không có đánh giá ${starFilter} sao nào bạn đã gửi`}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Sau khi hoàn thành các buổi học kèm 1:1 hoặc nhóm, bạn có thể gửi đánh giá cho Người hướng dẫn.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGiven.map((r, idx) => {
              const mentorName = r.mentorName || 'Người hướng dẫn';
              const avatarBg = BG_COLORS[idx % BG_COLORS.length];
              const date = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('vi-VN') : '';
              const { tags, cleanComment } = parseTags(r.comment);
              const sessionLabel = r.sessionType === 'GROUP' || r.roomId ? 'Học nhóm' : 'Buổi kèm 1:1';

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/40 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ReviewAvatar
                        src={r.mentorAvatar}
                        name={mentorName}
                        bgClass={avatarBg}
                        userId={r.mentorId}
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {r.mentorId ? (
                            <Link
                              to={`/profile/${r.mentorId}`}
                              className="text-xs font-bold text-gray-900 hover:text-primary-600 hover:underline block leading-tight transition-colors cursor-pointer"
                              title={`Xem hồ sơ của ${mentorName}`}
                            >
                              {mentorName}
                            </Link>
                          ) : (
                            <span className="text-xs font-bold text-gray-900 block leading-tight">
                              {mentorName}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-100">
                            {sessionLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= r.stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-bold text-slate-600 ml-1">
                            {r.stars}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 font-medium">{date}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedRatingDetail({ rating: r, mode: 'GIVEN' })}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Feedback Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-11">
                      {tags.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Feedback Content */}
                  <p className="text-xs text-gray-600 leading-relaxed pl-11 italic">
                    "{cleanComment || 'Buổi học rất tốt!'}"
                  </p>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 5. VIEW RATING DETAIL MODAL */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <ViewRatingModal
        isOpen={Boolean(selectedRatingDetail)}
        onClose={() => setSelectedRatingDetail(null)}
        rating={selectedRatingDetail?.rating || null}
        mode={selectedRatingDetail?.mode || 'RECEIVED'}
      />
    </div>
  );
};
