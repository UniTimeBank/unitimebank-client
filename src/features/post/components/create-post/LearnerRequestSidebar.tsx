import React from 'react';
import { useGetMyWalletQuery } from '@/core/api/wallet/walletApi';
import { useUserProfile } from '@/features/user/hooks';
import { UnifiedPostCard } from '../cards/UnifiedPostCard';


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
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-gray-100 pb-3">
          XEM TRƯỚC BÀI TÌM MENTOR
        </h3>

        <UnifiedPostCard
          data={{
            type: 'LEARNER',
            title: subject || 'Tên môn học / Kỹ năng cần tìm Mentor',
            description:
              shortDescription ||
              (goals ? goals.replace(/<[^>]+>/g, ' ').slice(0, 120) : '') ||
              'Mô tả cụ thể những kiến thức hoặc bài tập bạn muốn được hỗ trợ giải đáp...',
            coverImage: coverImage,
            primaryTag: subject ? subject.toUpperCase().slice(0, 14) : 'HỌC TẬP',
            secondaryTags: ['Cần hỗ trợ', 'Lớp 1:1'],
            authorName: profile?.displayName || 'Bạn (Học viên)',
            authorAvatar: profile?.avatarUrl,
            authorSubtitle: 'Sinh viên UniTime',
            trustScore: rawTrust > 10 ? rawTrust : rawTrust * 10,
            creditAmount: durationMinutes || 60,
            creditText: `${durationMinutes || 60} credit`,
            timelineText: timeline || 'Trong 3 ngày',
            isPreview: true,
          }}
        />
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
