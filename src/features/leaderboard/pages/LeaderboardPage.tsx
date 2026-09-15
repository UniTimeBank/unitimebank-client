import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  useGetMentorLeaderboardQuery,
  useGetLearnerLeaderboardQuery,
} from '@/core/api/moderation';
import {
  LeaderboardHeaderBanner,
  LeaderboardFormulaModal,
  MentorPodiumCard,
  LearnerPodiumCard,
  MentorListItem,
  LearnerListItem,
  LeaderboardTrustScoreCallout,
} from '../components';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mentors' | 'learners'>('mentors');
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const {
    data: mentorData,
    isLoading: isLoadingMentors,
  } = useGetMentorLeaderboardQuery(
    { timeframe, limit: 30 },
    { skip: activeTab !== 'mentors' },
  );

  const {
    data: learnerData,
    isLoading: isLoadingLearners,
  } = useGetLearnerLeaderboardQuery(
    { timeframe, limit: 30 },
    { skip: activeTab !== 'learners' },
  );

  const mentors = mentorData?.items || [];
  const learners = learnerData?.items || [];

  const top3Mentors = mentors.slice(0, 3);
  const restMentors = mentors.slice(3);

  const top3Learners = learners.slice(0, 3);
  const restLearners = learners.slice(3);

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} giờ`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner Card */}
      <LeaderboardHeaderBanner
        activeTab={activeTab}
        onTabChange={setActiveTab}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onOpenFormula={() => setShowFormulaModal(true)}
      />

      {/* 2. Main Content Section (Podium + Table) */}
      <div className="space-y-8">
        {/* TOP 3 PODIUM SECTION */}
        {activeTab === 'mentors' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Rank 2 (Silver) */}
            {top3Mentors[1] && (
              <div className="order-2 md:order-1 pt-0 md:pt-6">
                <MentorPodiumCard item={top3Mentors[1]} rank={2} formatMinutes={formatMinutes} />
              </div>
            )}
            {/* Rank 1 (Gold) */}
            {top3Mentors[0] && (
              <div className="order-1 md:order-2">
                <MentorPodiumCard item={top3Mentors[0]} rank={1} formatMinutes={formatMinutes} />
              </div>
            )}
            {/* Rank 3 (Bronze) */}
            {top3Mentors[2] && (
              <div className="order-3 md:order-3 pt-0 md:pt-10">
                <MentorPodiumCard item={top3Mentors[2]} rank={3} formatMinutes={formatMinutes} />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Rank 2 (Silver) */}
            {top3Learners[1] && (
              <div className="order-2 md:order-1 pt-0 md:pt-6">
                <LearnerPodiumCard item={top3Learners[1]} rank={2} formatMinutes={formatMinutes} />
              </div>
            )}
            {/* Rank 1 (Gold) */}
            {top3Learners[0] && (
              <div className="order-1 md:order-2">
                <LearnerPodiumCard item={top3Learners[0]} rank={1} formatMinutes={formatMinutes} />
              </div>
            )}
            {/* Rank 3 (Bronze) */}
            {top3Learners[2] && (
              <div className="order-3 md:order-3 pt-0 md:pt-10">
                <LearnerPodiumCard item={top3Learners[2]} rank={3} formatMinutes={formatMinutes} />
              </div>
            )}
          </div>
        )}

        {/* 3. TABLE / LIST SECTION (Subsequent Ranks) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>
                {activeTab === 'mentors'
                  ? 'Danh Sách Người Dạy Xuất Sắc'
                  : 'Danh Sách Học Viên Tích Cực'}
              </span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {activeTab === 'mentors' ? mentors.length : learners.length} thành viên vinh danh
            </span>
          </div>

          {activeTab === 'mentors' ? (
            <div className="divide-y divide-slate-100">
              {isLoadingMentors ? (
                <div className="p-12 text-center text-xs text-slate-500">Đang tải bảng xếp hạng...</div>
              ) : mentors.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">Chưa có dữ liệu người dạy.</div>
              ) : (
                mentors.map((item, idx) => (
                  <MentorListItem key={item.userId} item={item} rank={idx + 1} formatMinutes={formatMinutes} />
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {isLoadingLearners ? (
                <div className="p-12 text-center text-xs text-slate-500">Đang tải bảng xếp hạng...</div>
              ) : learners.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">Chưa có dữ liệu học viên.</div>
              ) : (
                learners.map((item, idx) => (
                  <LearnerListItem key={item.userId} item={item} rank={idx + 1} formatMinutes={formatMinutes} />
                ))
              )}
            </div>
          )}
        </div>

        {/* 4. Trust Score Explanation Callout */}
        <LeaderboardTrustScoreCallout />
      </div>

      {/* 5. Formula Explanation Modal using shared Modal */}
      <LeaderboardFormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
      />
    </div>
  );
};

export default LeaderboardPage;
