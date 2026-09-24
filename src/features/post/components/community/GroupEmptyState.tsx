import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { ROUTES } from '@/routes/paths';

interface GroupEmptyStateProps {
  isMyGroupsTab: boolean;
}

export const GroupEmptyState: React.FC<GroupEmptyStateProps> = ({ isMyGroupsTab }) => {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-2xs space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-3xl mx-auto flex items-center justify-center">
        <Users className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900">
          {isMyGroupsTab
            ? 'Bạn chưa tham gia nhóm nào'
            : 'Không tìm thấy nhóm học tập phù hợp'}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          {isMyGroupsTab
            ? 'Hãy chuyển sang tab "Khám phá tất cả nhóm" để tham gia hoặc tự tạo nhóm cho riêng mình.'
            : 'Hãy thử tìm kiếm với từ khóa khác hoặc tạo một nhóm học tập mới ngay hôm nay.'}
        </p>
      </div>
      <Link
        to={ROUTES.COMMUNITY_CREATE}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Tạo nhóm ngay</span>
      </Link>
    </div>
  );
};
