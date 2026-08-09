import React from 'react';
import { Zap, ShieldCheck, Clock } from 'lucide-react';
import type { LearnerRequest } from '../../types';
import { getCategoryBadge } from '../../utils';

interface LearnerRequestCardProps {
  request: LearnerRequest;
  onTeachClick?: (request: LearnerRequest) => void;
  isUrgent?: boolean;
  featured?: boolean;
}

export const LearnerRequestCard: React.FC<LearnerRequestCardProps> = ({
  request,
  onTeachClick,
  isUrgent = false,
  featured = false,
}) => {
  const badge = getCategoryBadge(request.category);

  return (
    <div
      className={`relative bg-white rounded-2xl p-6 transition-all duration-300 border ${
        featured
          ? 'border-primary-200 shadow-md ring-1 ring-primary-100'
          : 'border-gray-100/90 shadow-2xs hover:shadow-md hover:border-gray-200'
      } flex flex-col justify-between h-full group`}
    >
      <div>
        {/* Top Badges & Credits */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-red-50 text-red-600 border border-red-200 uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-red-500 text-red-500" />
                CẦN GẤP
              </span>
            )}
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider border ${badge.style}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="flex items-baseline gap-1 text-right">
            <span className="text-xl font-black text-primary-600 tracking-tight">
              {request.expectedCreditAmount || request.expectedDurationMinutes || 60}
            </span>
            <span className="text-2xs font-bold text-gray-400 uppercase">Credit</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {request.skillNeeded}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-3 mb-5 leading-relaxed">
          {request.description ||
            `Cần tìm người hướng dẫn kiến thức môn ${request.skillNeeded}, giải đáp bài tập và củng cố phương pháp.`}
        </p>
      </div>

      <div>
        {/* Author Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mb-4">
          <div className="flex items-center gap-2.5">
            {request.learnerAvatar ? (
              <img
                src={request.learnerAvatar}
                alt={request.learnerName || 'Người học'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-teal-200 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(request.learnerName || 'N').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-gray-800 leading-tight">
                {request.learnerName || 'Marcus Thorne'}
              </div>
              <div className="flex items-center gap-1 text-3xs font-semibold text-gray-400 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-primary-500" />
                <span>4.9 ĐIỂM UY TÍN</span>
              </div>
            </div>
          </div>

          {request.sessionType && (
            <div className="flex items-center gap-1 text-3xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{request.sessionType === 'GROUP' ? 'Lớp nhóm' : 'Lớp 1:1'}</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onTeachClick?.(request)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            featured
              ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-xs hover:shadow-md'
              : 'border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white'
          }`}
        >
          <span>Tôi có thể dạy môn này</span>
        </button>
      </div>
    </div>
  );
};
