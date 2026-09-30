import React, { useState } from 'react';
import { Star, Loader2, Sparkles, Check } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useSubmitRatingMutation } from '@/core/api/moderation';
import { useUserProfile } from '@/features/user/hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import toast from 'react-hot-toast';

export interface PostSessionRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  roomId?: string;
  sessionType?: 'ONE_ON_ONE' | 'GROUP';
  mentorId: string;
  mentorName?: string;
  mentorAvatar?: string;
  partnerRole?: string;
  sessionId?: string;
  initialStars?: number;
  onSuccess?: () => void;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Chưa hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Rất hài lòng',
};

interface StarSuggestion {
  label: string;
  tags: string[];
}

const STAR_SUGGESTIONS: Record<number, StarSuggestion> = {
  5: {
    label: 'Điểm nổi bật',
    tags: [
      'Giải thích dễ hiểu',
      'Chuẩn bị bài kỹ',
      'Nhiệt tình & kiên nhẫn',
      'Đúng giờ',
      'Tương tác tốt',
      'Kiến thức chuyên sâu',
      'Tài liệu bổ ích',
    ],
  },
  4: {
    label: 'Điểm nổi bật',
    tags: [
      'Giải thích dễ hiểu',
      'Nhiệt tình & kiên nhẫn',
      'Đúng giờ',
      'Tương tác tốt',
      'Dễ tiếp thu',
      'Nội dung thực tế',
    ],
  },
  3: {
    label: 'Điểm nổi bật & Cần cải thiện',
    tags: [
      'Đúng giờ',
      'Nội dung cơ bản',
      'Cần giải thích chậm hơn',
      'Cần chuẩn bị bài kỹ hơn',
      'Cần tăng tương tác',
      'Đường truyền chưa ổn định',
    ],
  },
  2: {
    label: 'Điểm cần cải thiện',
    tags: [
      'Giải thích khó hiểu',
      'Chưa chuẩn bị bài',
      'Vào lớp muộn',
      'Thiếu kiên nhẫn',
      'Ít tương tác',
      'Mạng / Micro chập chờn',
    ],
  },
  1: {
    label: 'Điểm cần cải thiện',
    tags: [
      'Vào trễ giờ',
      'Không chuẩn bị bài',
      'Giải thích khó hiểu',
      'Thái độ chưa tốt',
      'Kết thúc sớm',
      'Mất kết nối nhiều lần',
    ],
  },
};

export const PostSessionRatingModal: React.FC<PostSessionRatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  roomId,
  sessionType,
  mentorId,
  mentorName = 'Người hướng dẫn',
  mentorAvatar,
  partnerRole = 'Người hướng dẫn',
  sessionId,
  initialStars,
  onSuccess,
}) => {
  const [stars, setStars] = useState<number>(initialStars || 5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');

  React.useEffect(() => {
    if (isOpen && initialStars) {
      setStars(initialStars);
    }
  }, [isOpen, initialStars]);

  const authUser = useAppSelector(selectCurrentUser);
  const { profile } = useUserProfile();

  const [submitRating, { isLoading }] = useSubmitRatingMutation();

  const handleStarClick = (newStars: number) => {
    setStars(newStars);
    const newTags = STAR_SUGGESTIONS[newStars]?.tags || [];
    setSelectedTags((prev) => prev.filter((t) => newTags.includes(t)));
  };

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
        bookingId: bookingId || undefined,
        roomId: roomId || undefined,
        sessionType: sessionType || (roomId ? 'GROUP' : 'ONE_ON_ONE'),
        sessionId: sessionId || bookingId || roomId,
        mentorId,
        mentorName,
        mentorAvatar,
        stars,
        comment: fullComment || undefined,
        reviewerName,
        reviewerAvatar,
      }).unwrap();

      if (roomId) {
        localStorage.setItem(`rated_room_${roomId}`, 'true');
      }
      if (bookingId) {
        localStorage.setItem(`rated_booking_${bookingId}`, 'true');
      }

      toast.success('Đã gửi đánh giá');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.data?.message || 'Không thể gửi đánh giá, vui lòng thử lại sau.';
      toast.error(errorMsg);
    }
  };

  const activeStars = hoverStars ?? stars;
  const currentSuggestion = STAR_SUGGESTIONS[activeStars] || STAR_SUGGESTIONS[stars] || STAR_SUGGESTIONS[5];
  const placeholderText =
    stars >= 4
      ? 'Chia sẻ thêm cảm nhận tích cực của bạn về buổi học...'
      : stars === 3
      ? 'Gợi ý thêm để buổi học sau đạt hiệu quả tốt hơn...'
      : 'Chia sẻ chi tiết những điểm bạn chưa hài lòng để ghi nhận và cải thiện...';

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
            <p className="text-xs text-gray-500 truncate">{partnerRole}</p>
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
                onClick={() => handleStarClick(star)}
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
          <span className="text-xs font-semibold text-gray-700 h-4">
            {STAR_LABELS[activeStars]}
          </span>
        </div>

        {/* Dynamic Star-based Tags: Điểm nổi bật */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentSuggestion.label}</span>
            </span>
            <span className="text-[11px] text-gray-400">Gợi ý theo {stars} sao</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {currentSuggestion.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? stars >= 4
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-2xs'
                        : stars === 3
                        ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-2xs'
                        : 'bg-rose-50 text-rose-800 border-rose-300 font-semibold shadow-2xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  <span>{tag}</span>
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
            placeholder={placeholderText}
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
