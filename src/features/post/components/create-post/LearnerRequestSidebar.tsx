import React from 'react';

interface LearnerRequestSidebarProps {
  subject: string;
  coverImage?: string;
  level: string;
  goals: string;
  durationMinutes: number;
  timeline: string;
  userCredits?: number;
  trustScore?: number;
}

export const LearnerRequestSidebar: React.FC<LearnerRequestSidebarProps> = ({
  subject,
  coverImage,
  level,
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
              {/* Category / Level Badge */}
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide bg-white/95 text-gray-900 shadow-2xs">
                YÊU CẦU HỌC • {level.toUpperCase()}
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

              <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                {goals || 'Mô tả cụ thể những thắc mắc hoặc bài tập bạn cần người hướng dẫn giải đáp...'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <div>Thời hạn: {timeline || 'Trong 3 ngày'}</div>
            <div className="text-teal-800 font-extrabold flex items-center gap-1">
              <span>XEM CHI TIẾT</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 1: Wallet Balance */}
      <div className="bg-[#1b2a3a] text-white rounded-3xl p-6 shadow-md space-y-3">
        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
          SỐ DƯ VÍ THỜI GIAN
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black">{userCredits}</span>
          <span className="text-xs font-bold text-teal-400 uppercase">CREDIT</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="w-4/5 h-full bg-teal-400 rounded-full" />
        </div>
        <p className="text-xs text-gray-400 font-medium">Đủ ngân sách cho ~7 giờ học tập 1-1</p>
      </div>

      {/* Card 2: Trust Score */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
        <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
          ĐIỂM UY TÍN CỦA BẠN
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-sm text-emerald-700 shrink-0">
            {trustScore.toFixed(1)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Xuất Sắc</h4>
            <p className="text-xs text-gray-500">Top 5% Người học tích cực</p>
          </div>
        </div>
      </div>
    </div>
  );
};
