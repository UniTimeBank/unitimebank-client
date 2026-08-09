import React from 'react';

interface MentorPostPreviewProps {
  category: string;
  title: string;
  description: string;
  coverImage?: string;
}

export const MentorPostPreview: React.FC<MentorPostPreviewProps> = ({
  category,
  title,
  description,
  coverImage,
}) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between">
          <span>XEM TRƯỚC BÀI ĐĂNG TRÊN SÀN</span>
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase">• TRỰC TIẾP</span>
        </h3>

        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <img
                src={coverImage || defaultThumbnail}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide bg-white/95 text-gray-900 shadow-2xs">
                {category || 'STEM'}
              </span>
              <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs shadow-md">
                60 credit/giờ
              </div>
            </div>

            <div className="p-5 space-y-2">
              <h4 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">
                {title || 'Hướng dẫn Lập trình Python & Phân tích Dữ liệu'}
              </h4>

              <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {description || 'Nắm bắt chuyên sâu các kỹ thuật xử lý dữ liệu với Pandas, NumPy...'}
              </p>
            </div>
          </div>

          <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <div>Lịch gần nhất: 3 Th9</div>
            <div className="text-teal-800 font-extrabold flex items-center gap-1">
              <span>XEM CHI TIẾT</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Info Card */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-sm space-y-2">
        <h4 className="text-sm font-bold">Mẹo đăng bài dạy hiệu quả</h4>
        <p className="text-xs text-emerald-100/80 leading-relaxed">
          Đặt tiêu đề rõ ràng kèm môn học/công nghệ cụ thể giúp bài dạy của bạn tiếp cận gấp 2 lần sinh viên có nhu cầu trong 24 giờ.
        </p>
      </div>
    </div>
  );
};
