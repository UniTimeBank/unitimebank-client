import React from 'react';
import { Eye, HelpCircle } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <Eye className="w-4 h-4 text-primary-600" />
          <span>Xem trước thẻ nhóm</span>
        </div>

        {/* Simulated Group Card */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-2xs">
          <div className="relative h-32 w-full bg-slate-800 overflow-hidden">
            <img
              src={coverUrl}
              alt="Preview cover"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute top-2 left-2">
              <span className="px-2.5 py-0.5 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black rounded-full shadow-xs">
                {category}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-2 bg-white">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
              {name.trim() || 'Tên nhóm học tập của bạn'}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {description.trim() || 'Mô tả mục tiêu và nội dung chính của nhóm học tập...'}
            </p>
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>1 thành viên</span>
              <span className="text-primary-600 font-bold">Xem nhóm →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Sidebar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
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
