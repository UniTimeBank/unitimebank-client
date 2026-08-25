import React from 'react';
import { Star, MessageSquareQuote, Loader2, Sparkles } from 'lucide-react';
import { useGetReviewsByUserQuery } from '@/core/api/moderation';

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
}

const BG_COLORS = [
  'bg-amber-100 text-amber-800',
  'bg-primary-100 text-primary-800',
  'bg-emerald-100 text-emerald-800',
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
];

export const PeerReviewsSection: React.FC<PeerReviewsSectionProps> = ({
  userId,
  reviews: externalReviews,
  persona = 'MENTOR',
}) => {
  const isMentor = persona === 'MENTOR';

  const { data: reviewsData, isLoading } = useGetReviewsByUserQuery(
    { userId: userId || '', page: 1, limit: 10 },
    { skip: !userId },
  );

  const realReviews: Review[] = React.useMemo(() => {
    if (!reviewsData?.reviews) return [];
    return reviewsData.reviews.map((r, idx) => {
      const author = r.reviewerName || 'Học viên UniTime';
      const initials = author.slice(0, 2).toUpperCase();
      const avatarBg = BG_COLORS[idx % BG_COLORS.length];
      const date = new Date(r.submittedAt).toLocaleDateString('vi-VN');
      return {
        id: r.id,
        author,
        avatarUrl: r.reviewerAvatar,
        initials,
        avatarBg,
        date,
        content: r.comment || 'Buổi học rất bổ ích và chất lượng!',
        stars: r.stars,
      };
    });
  }, [reviewsData]);

  const displayReviews = externalReviews && externalReviews.length > 0
    ? externalReviews
    : realReviews;

  const averageRating = reviewsData?.averageRating ?? 0;
  const totalReviews = reviewsData?.totalReviews ?? displayReviews.length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-primary-600" />
          <span>{isMentor ? 'Đánh giá từ người học' : 'Đánh giá thái độ từ Người hướng dẫn'}</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Star className={`w-4 h-4 ${totalReviews > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          <span>{totalReviews > 0 ? averageRating.toFixed(1) : 'Chưa có'}</span>
          <span className="text-gray-400 font-normal">
            ({totalReviews} đánh giá)
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Đang tải đánh giá...</span>
        </div>
      ) : displayReviews.length === 0 ? (
        <div className="text-center py-8 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">Chưa có đánh giá nào</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Đánh giá sẽ xuất hiện tại đây sau khi hoàn thành các buổi học.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayReviews.map((rev) => (
            <div key={rev.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {rev.avatarUrl ? (
                    <img
                      src={rev.avatarUrl}
                      alt={rev.author}
                      className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${rev.avatarBg} shrink-0`}>
                      {rev.initials}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{rev.author}</span>
                    {rev.stars && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 ${
                              s <= rev.stars!
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-gray-400">{rev.date}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed pl-9">
                "{rev.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
