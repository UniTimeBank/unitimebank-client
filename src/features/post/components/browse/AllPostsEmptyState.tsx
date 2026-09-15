import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui';

interface AllPostsEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const AllPostsEmptyState: React.FC<AllPostsEmptyStateProps> = ({
  hasActiveFilters,
  onResetFilters,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-4 max-w-lg mx-auto my-10 shadow-2xs">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
        <BookOpen className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài đăng phù hợp</h3>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          Không có kết quả nào khớp với bộ lọc hoặc từ khóa bạn đang tìm kiếm. Hãy thử điều chỉnh hoặc đăng bài mới.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="rounded-xl text-xs font-bold"
          >
            Xóa bộ lọc
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate('/requests')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="rounded-xl text-xs font-bold"
        >
          Đăng bài ngay
        </Button>
      </div>
    </div>
  );
};
