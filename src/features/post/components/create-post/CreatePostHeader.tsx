import React from 'react';
import { Tabs, TabOption } from '@/shared/components/ui';

interface CreatePostHeaderProps {
  postType: 'MENTOR_OFFER' | 'LEARNER_REQUEST';
  onPostTypeChange: (type: 'MENTOR_OFFER' | 'LEARNER_REQUEST') => void;
}

export const CreatePostHeader: React.FC<CreatePostHeaderProps> = ({
  postType,
  onPostTypeChange,
}) => {
  const tabOptions: TabOption<'MENTOR_OFFER' | 'LEARNER_REQUEST'>[] = [
    {
      value: 'MENTOR_OFFER',
      label: 'Đăng bài dạy',
    },
    {
      value: 'LEARNER_REQUEST',
      label: 'Đăng yêu cầu học',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="bg-[#1b2a3a] text-white rounded-3xl p-8 md:p-10 shadow-xs border border-slate-800">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            TRANG ĐĂNG BÀI UNITIMEBANK
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Tạo Bài Đăng Mới
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Đăng bài dạy kỹ năng để chia sẻ kiến thức (nhận Credit) hoặc đăng bài tìm Mentor hướng dẫn môn học (trả Credit).
          </p>
        </div>
      </div>

      {/* POST TYPE SWITCHER (Clean Single Color Tabs) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">
          LOẠI BÀI ĐĂNG
        </span>

        <Tabs<'MENTOR_OFFER' | 'LEARNER_REQUEST'>
          options={tabOptions}
          value={postType}
          onChange={onPostTypeChange}
          variant="segmented"
          size="md"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};
