import React from 'react';
import { PenSquare } from 'lucide-react';
import type { GroupPostTag } from '@/features/post/types';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { useGetMeQuery } from '@/core/api/user';
import { toast } from 'react-hot-toast';

interface GroupPostCreatorProps {
  isMember?: boolean;
  onOpenCreateModal: (initialTag?: GroupPostTag) => void;
}

export const GroupPostCreator: React.FC<GroupPostCreatorProps> = ({
  isMember,
  onOpenCreateModal,
}) => {
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });
  const displayName = userProfile?.displayName || authUser?.email?.split('@')[0] || 'Bạn';
  const avatarUrl = userProfile?.avatarUrl;

  const handleTrigger = (tag?: GroupPostTag) => {
    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm trước khi tạo bài viết!');
      return;
    }
    onOpenCreateModal(tag);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0 shadow-2xs"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            {displayName.charAt(0) || 'U'}
          </div>
        )}

        <button
          type="button"
          onClick={() => handleTrigger()}
          className="flex-1 bg-gray-50 hover:bg-gray-100/90 text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-left transition-all cursor-pointer border border-gray-200/60 hover:border-gray-300 truncate"
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
    </div>
  );
};
