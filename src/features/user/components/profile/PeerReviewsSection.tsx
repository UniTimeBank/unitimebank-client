import React from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  initials: string;
  avatarBg: string;
  date: string;
  content: string;
}

interface PeerReviewsSectionProps {
  reviews?: Review[];
  persona?: 'MENTOR' | 'LEARNER';
}

const DEFAULT_MENTOR_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'James Miller',
    initials: 'JM',
    avatarBg: 'bg-amber-100 text-amber-800',
    date: '2 ngày trước',
    content: 'Bạn hướng dẫn rất thực tế và dễ hiểu. Chuẩn bị tài liệu và code mẫu kỹ càng!',
  },
  {
    id: 'rev-2',
    author: 'Anita Lee',
    initials: 'AL',
    avatarBg: 'bg-primary-100 text-primary-800',
    date: '1 tuần trước',
    content: 'Buổi hướng dẫn rất bổ ích, giải đáp đúng trọng tâm vướng mắc. Cảm ơn bạn!',
  },
];

const DEFAULT_LEARNER_REVIEWS: Review[] = [
  {
    id: 'rev-l1',
    author: 'David Kovac (Mentor C++)',
    initials: 'DK',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    date: '3 ngày trước',
    content: 'Bạn học rất nghiêm túc, chuẩn bị sẵn câu hỏi và code trước khi vào buổi học.',
  },
  {
    id: 'rev-l2',
    author: 'Trần Minh (Mentor Giải Tích)',
    initials: 'TM',
    avatarBg: 'bg-indigo-100 text-indigo-800',
    date: '2 tuần trước',
    content: 'Rất đúng giờ, thái độ cầu thị, tôn trọng người dạy và tiếp thu kiến thức cực nhanh.',
  },
];

export const PeerReviewsSection: React.FC<PeerReviewsSectionProps> = ({
  reviews,
  persona = 'MENTOR',
}) => {
  const isMentor = persona === 'MENTOR';
  const displayReviews = reviews && reviews.length > 0
    ? reviews
    : isMentor
    ? DEFAULT_MENTOR_REVIEWS
    : DEFAULT_LEARNER_REVIEWS;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-primary-600" />
          <span>{isMentor ? 'Đánh giá từ người học' : 'Đánh giá thái độ từ Người hướng dẫn'}</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{isMentor ? '4.9' : '5.0'}</span>
          <span className="text-gray-400 font-normal">
            {isMentor ? '(48 đánh giá)' : '(14 đánh giá)'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {displayReviews.map((rev) => (
          <div key={rev.id} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${rev.avatarBg}`}>
                  {rev.initials}
                </div>
                <span className="text-xs font-bold text-gray-900">{rev.author}</span>
              </div>
              <span className="text-[11px] text-gray-400">{rev.date}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pl-9">
              "{rev.content}"
            </p>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
        Xem tất cả đánh giá
      </button>
    </div>
  );
};

