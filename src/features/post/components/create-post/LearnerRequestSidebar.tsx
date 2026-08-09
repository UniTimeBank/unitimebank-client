import React from 'react';

interface LearnerRequestSidebarProps {
  subject: string;
  coverImage?: string;
  goals: string;
  durationMinutes: number;
  timeline: string;
  userCredits?: number;
  trustScore?: number;
}

export const LearnerRequestSidebar: React.FC<LearnerRequestSidebarProps> = ({
  subject,
  coverImage,
  goals,
  durationMinutes,
  timeline,
  userCredits = 420,
  trustScore = 9.0,
}) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="space-y-6">
      {/* Live Preview Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between">
          <span>XEM TRƯỚC BÀI ĐĂNG TRÊN SÀN</span>
          <span className="text-[10px] text-teal-600 font-extrabold uppercase">• TRỰC TIẾP</span>
        </h3>

        {/* Vertical Card Preview */}
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            {/* Cover Image */}
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <img
                src={coverImage || defaultThumbnail}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Category Badge */}
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide bg-white/95 text-gray-900 shadow-2xs">
                YÊU CẦU HỌC 1:1
              </span>
              {/* Credit Badge */}
              <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs shadow-md">
                {durationMinutes || 60} credit
              </div>
            </div>

            {/* Body Content */}
            <div className="p-5 space-y-2">
              <h4 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">
                {subject || 'Tên môn học / Kỹ năng cần tìm Mentor'}
              </h4>

              <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed">
                {goals || 'Mô tả cụ thể những kiến thức hoặc bài tập bạn muốn được hỗ trợ giải đáp...'}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Thời hạn: {timeline || 'Trong 3 ngày'}</span>
            <span className="text-teal-700 font-extrabold">{durationMinutes || 60} phút học</span>
          </div>
        </div>
      </div>

      {/* Credit Overview Wallet Widget */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
            SỐ DƯ VÍ CREDIT HIỆN CÓ
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-700/60 text-[11px] font-extrabold text-teal-100 border border-teal-500/30">
            Tài khoản Sinh viên
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight">{userCredits}</span>
          <span className="text-xs font-bold text-teal-300">Credit khả dụng</span>
        </div>

        <div className="pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-200 font-medium">
          <span>Điểm uy tín của bạn:</span>
          <span className="font-extrabold text-white">★ {trustScore.toFixed(1)}/10</span>
        </div>
      </div>
    </div>
  );
};
