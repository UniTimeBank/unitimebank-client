import React from 'react';
import { Eye, HelpCircle, Users, MessageSquare, ArrowRight, UserPlus, Check } from 'lucide-react';

interface CreateGroupPreviewSidebarProps {
  name: string;
  description: string;
  category: string;
  coverUrl: string;
}

export const CreateGroupPreviewSidebar: React.FC<CreateGroupPreviewSidebarProps> = ({
  name,
  description,
  category,
  coverUrl,
}) => {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <Eye className="w-4 h-4 text-primary-600" />
          <span>Xem trước thẻ nhóm</span>
        </div>

        {/* Simulated Group Card Matching UnifiedPostCard Structure */}
        <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            {/* Header Media Thumbnail */}
            <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={coverUrl}
                alt="Preview cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

              {/* Category Badge */}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-slate-800 font-bold text-[10px] uppercase tracking-wider shadow-xs">
                {category}
              </span>

              {/* Members overlay count */}
              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>1 thành viên</span>
              </div>

              {/* Posts overlay count */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                <MessageSquare className="w-3 h-3 text-sky-400 shrink-0" />
                <span>0 bài viết</span>
              </div>
            </div>

            {/* Body */}
            <div className="px-1.5 pt-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                  U
                </div>
                <span className="text-[11px] font-semibold text-slate-600 truncate">Bạn (Quản trị viên)</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                {name.trim() || 'Tên nhóm học tập của bạn'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal min-h-[32px]">
                {description.trim() || 'Mô tả mục tiêu và nội dung chính của nhóm học tập...'}
              </p>
            </div>
          </div>

          {/* Footer Preview Actions */}
          <div className="px-1 pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Đã tham gia</span>
            </span>

            <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1">
              <span>Xem nhóm</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Tips Sidebar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Gợi ý xây dựng nhóm hiệu quả</span>
        </div>

        <div className="space-y-3 text-xs text-gray-600 leading-relaxed font-medium">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span>Đặt tên ngắn gọn, rõ ràng, có chứa tên môn học hoặc chuyên ngành.</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span>Nêu rõ mục tiêu nhóm (ôn thi, giải đề, làm đồ án lớn...).</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span>Tạo các bài viết đầu tiên để khuyến khích mọi người cùng tham gia thảo luận.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
