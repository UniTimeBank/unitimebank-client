import React from 'react';
import { Plus } from 'lucide-react';

interface WelcomeBannerProps {
  userName: string;
  onOpenAddSkillModal: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  onOpenAddSkillModal,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Chào buổi sáng, {userName}
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-500 mt-1">
          Bạn có 2 buổi học được xếp lịch diễn ra trong ngày hôm nay.
        </p>
      </div>

      <button
        onClick={onOpenAddSkillModal}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Đăng bài dạy</span>
      </button>
    </div>
  );
};
