import React from 'react';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  initials: string;
  avatarBg: string;
  date: string;
  content: string;
}

interface PeerReviewsSectionProps {
  reviews: Review[];
}

export const PeerReviewsSection: React.FC<PeerReviewsSectionProps> = ({ reviews }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">Đánh giá từ người học</h2>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-gray-400 font-normal">(48 đánh giá)</span>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((rev) => (
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
