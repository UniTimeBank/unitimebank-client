import React from 'react';
import { ShieldCheck, Clock, Coins } from 'lucide-react';
import type { LearnerRequest } from '../../types';
import { getCategoryBadge } from '../../utils';

interface LearnerRequestHeaderProps {
  request: LearnerRequest;
}

export const LearnerRequestHeader: React.FC<LearnerRequestHeaderProps> = ({ request }) => {
  const badge = getCategoryBadge(request.category);
  const creditAmount = request.expectedCreditAmount || request.expectedDurationMinutes || 60;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
      {/* Category & Session Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider border ${badge.style}`}>
            {badge.label}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-2xs uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>{request.sessionType === 'GROUP' ? 'Lớp nhóm' : 'Lớp 1:1'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-50 border border-primary-200 text-primary-700">
          <Coins className="w-5 h-5 text-primary-600" />
          <div className="text-right">
            <span className="text-lg font-black leading-none block">{creditAmount} Credit</span>
            <span className="text-3xs font-extrabold uppercase text-primary-600 block">Sẵn sàng chi trả</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider block mb-1">MÔN HỌC / KỸ NĂNG CẦN HỖ TRỢ</span>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
          {request.skillNeeded}
        </h1>
      </div>

      {/* Learner Profile Snapshot */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-3">
          {request.learnerAvatar ? (
            <img
              src={request.learnerAvatar}
              alt={request.learnerName || 'Học viên'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {(request.learnerName || 'H').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-gray-900">{request.learnerName || 'Học viên UniTime'}</h4>
            <p className="text-xs text-gray-500 font-semibold">Thành viên cần tìm người dạy</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 border border-primary-200">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-black">HỌC VIÊN CỘNG ĐỒNG</span>
        </div>
      </div>
    </div>
  );
};
