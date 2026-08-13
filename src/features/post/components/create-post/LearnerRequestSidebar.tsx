import React from 'react';
import { useGetMyWalletQuery } from '@/core/api/wallet/walletApi';
import { useUserProfile } from '@/features/user/hooks';
import { RichTextViewer } from './RichTextEditor';

interface LearnerRequestSidebarProps {
  subject: string;
  coverImage?: string;
  shortDescription?: string;
  goals: string;
  durationMinutes: number;
  timeline: string;
  userCredits?: number;
  trustScore?: number;
}

export const LearnerRequestSidebar: React.FC<LearnerRequestSidebarProps> = ({
  subject,
  coverImage,
  shortDescription,
  goals,
  durationMinutes,
  timeline,
  userCredits: propCredits,
  trustScore: propTrustScore,
}) => {
  const { data: walletData } = useGetMyWalletQuery();
  const { profile } = useUserProfile();

  const realCredits = propCredits ?? walletData?.availableBalance ?? (walletData as any)?.balance ?? 0;
  const rawTrust = propTrustScore ?? profile?.trustScore ?? 50;
  const displayTrustScore = rawTrust > 10 ? (rawTrust / 10).toFixed(1) : rawTrust.toFixed(1);

  return (
    <div className="space-y-6 sticky top-24">
      {/* Live Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3">
          XEM TRƯỚC BÀI TÌM MENTOR
        </h3>

        <div className="rounded-2xl border border-gray-200/90 overflow-hidden bg-white shadow-xs group hover:shadow-md transition-all">
          {/* Card Header Media */}
          <div className="relative h-44 overflow-hidden bg-gray-100">
            {coverImage ? (
              <img
                src={coverImage}
                alt={subject || 'Subject'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl">
                {subject ? subject.slice(0, 2).toUpperCase() : 'HỌC'}
              </div>
            )}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-extrabold text-xs">
              {durationMinutes || 60} credit
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-2">
            <h4 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">
              {subject || 'Tên môn học / Kỹ năng cần tìm Mentor'}
            </h4>

            {shortDescription ? (
              <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                {shortDescription}
              </p>
            ) : goals ? (
              <RichTextViewer content={goals} className="line-clamp-3" />
            ) : (
              <p className="text-xs text-gray-400 font-medium italic">
                Mô tả cụ thể những kiến thức hoặc bài tập bạn muốn được hỗ trợ giải đáp...
              </p>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Thời hạn: {timeline || 'Trong 3 ngày'}</span>
            <span className="text-teal-700 font-extrabold">{durationMinutes || 60} phút học</span>
          </div>
        </div>
      </div>

      {/* Credit Overview Wallet Widget (REAL DATA CONNECTED) */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
            SỐ DƯ VÍ CREDIT HIỆN CÓ
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-700/60 text-[11px] font-extrabold text-teal-100 border border-teal-500/30">
            {profile?.displayName || 'Tài khoản Sinh viên'}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight">{realCredits}</span>
          <span className="text-xs font-bold text-teal-300">Credit khả dụng</span>
        </div>

        <div className="pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-200 font-medium">
          <span>Điểm uy tín của bạn:</span>
          <span className="font-extrabold text-white">★ {displayTrustScore}/10</span>
        </div>
      </div>
    </div>
  );
};
