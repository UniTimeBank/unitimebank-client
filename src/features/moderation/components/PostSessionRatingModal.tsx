import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useSubmitRatingMutation } from '@/core/api/moderation';
import { useUserProfile } from '@/features/user/hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import toast from 'react-hot-toast';

export interface PostSessionRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  mentorId: string;
  mentorName?: string;
  mentorAvatar?: string;
  sessionId?: string;
  onSuccess?: () => void;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Rất hài lòng',
};

const QUICK_TAGS = [
  'Giải thích dễ hiểu',
  'Chuẩn bị bài kỹ',
  'Nhiệt tình & kiên nhẫn',
  'Đúng giờ',
  'Tương tác tốt',
];

export const PostSessionRatingModal: React.FC<PostSessionRatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  mentorId,
  mentorName = 'Người hướng dẫn',
  mentorAvatar,
  sessionId,
  onSuccess,
}) => {
  const [stars, setStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');

  const authUser = useAppSelector(selectCurrentUser);
  const { profile } = useUserProfile();

  const [submitRating, { isLoading }] = useSubmitRatingMutation();

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    try {
      const fullComment = [
        ...selectedTags.map((t) => `[${t}]`),
        comment.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      const reviewerName = profile?.displayName || 'Học viên';
      const reviewerAvatar = profile?.avatarUrl || '';

      await submitRating({
        bookingId,
        sessionId,
        mentorId,
        stars,
        comment: fullComment || undefined,
        reviewerName,
        reviewerAvatar,
      }).unwrap();

      toast.success('Đã gửi đánh giá');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.data?.message || 'Không thể gửi đánh giá, vui lòng thử lại sau.';
      toast.error(errorMsg);
    }
  };

  const activeStars = hoverStars ?? stars;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Đánh giá buổi học">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Mentor Info */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs shrink-0 border border-gray-200">
            {mentorAvatar ? (
              <img src={mentorAvatar} alt={mentorName} className="w-full h-full object-cover" />
            ) : (
              mentorName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{mentorName}</h4>
            <p className="text-xs text-gray-500 truncate">Người hướng dẫn</p>
          </div>
        </div>

        {/* Clean Star Rating */}
        <div className="flex flex-col items-center justify-center py-2 gap-1">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverStars(star)}
                onMouseLeave={() => setHoverStars(null)}
                onClick={() => setStars(star)}
                className="p-1 focus:outline-none transition-colors cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= activeStars
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-600 h-4">
            {STAR_LABELS[activeStars]}
          </span>
        </div>

        {/* Quick Tags */}
        <div className="space-y-1.5">
          <span className="text-xs text-gray-600 font-medium">Đánh giá nhanh</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-gray-900 text-white border-gray-900 font-medium'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-700">
            Nhận xét thêm (không bắt buộc)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ thêm cảm nhận của bạn về buổi học..."
            className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg text-gray-600 text-xs px-3.5 py-1.5 border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading}
            className="rounded-lg bg-primary-700 hover:bg-primary-800 text-white text-xs px-4 py-1.5 font-medium cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang gửi...</span>
              </span>
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
