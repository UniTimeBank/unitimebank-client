import React from 'react';
import {
  PenSquare,
  Image as ImageIcon,
  HelpCircle,
  FolderDown,
  Users,
} from 'lucide-react';
import type { GroupPostTag } from '@/features/post/types';
import { useAppSelector } from '@/core/store';
import { selectCurrentUser } from '@/core/store';
import { toast } from 'react-hot-toast';

interface GroupPostCreatorProps {
  isMember?: boolean;
  onOpenCreateModal: (initialTag?: GroupPostTag) => void;
}

export const GroupPostCreator: React.FC<GroupPostCreatorProps> = ({
  isMember,
  onOpenCreateModal,
}) => {
  const currentUser = useAppSelector(selectCurrentUser);

  const handleTrigger = (tag?: GroupPostTag) => {
    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm trước khi tạo bài viết!');
      return;
    }
    onOpenCreateModal(tag);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xs space-y-3.5">
      {/* Top Input Simulation Bar */}
      <div className="flex items-center gap-3">
        {currentUser?.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName || 'User'}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.fullName?.charAt(0) || 'U'}
          </div>
        )}

        <button
          type="button"
          onClick={() => handleTrigger()}
          className="flex-1 bg-gray-50 hover:bg-gray-100/90 text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-left transition-all cursor-pointer border border-gray-200/60 hover:border-gray-300"
        >
          {isMember
            ? 'Bạn muốn đặt câu hỏi, chia sẻ tài liệu hay tìm bạn cùng học?...'
            : 'Hãy tham gia nhóm để đăng bài viết và thảo luận...'}
        </button>

        <button
          type="button"
          onClick={() => handleTrigger()}
          className="px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <PenSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo bài viết</span>
        </button>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="pt-2 border-t border-gray-100/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleTrigger('QA')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Hỏi đáp bài tập</span>
          </button>

          <button
            type="button"
            onClick={() => handleTrigger('DOCUMENT')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/70 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FolderDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Chia sẻ tài liệu</span>
          </button>

          <button
            type="button"
            onClick={() => handleTrigger('STUDY_BUDDY')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/70 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Tìm bạn học</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleTrigger()}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ảnh đính kèm</span>
        </button>
      </div>
    </div>
  );
};
