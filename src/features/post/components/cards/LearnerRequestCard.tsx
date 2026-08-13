import React from 'react';
import { ShieldCheck, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LearnerRequest } from '../../types';
import { getCategoryBadge } from '../../utils';
import { RichTextViewer } from '../create-post/RichTextEditor';

interface LearnerRequestCardProps {
  request: LearnerRequest;
  onTeachClick?: (request: LearnerRequest) => void;
  featured?: boolean;
}

const DAY_MAP: Record<string, string> = {
  MONDAY: 'T2',
  TUESDAY: 'T3',
  WEDNESDAY: 'T4',
  THURSDAY: 'T5',
  FRIDAY: 'T6',
  SATURDAY: 'T7',
  SUNDAY: 'CN',
};

export const LearnerRequestCard: React.FC<LearnerRequestCardProps> = ({
  request,
  onTeachClick,
  featured = false,
}) => {
  const badge = getCategoryBadge(request.category);

  return (
    <div
      className={`bg-white rounded-3xl p-6 border shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
        featured ? 'border-primary-300 bg-gradient-to-b from-primary-50/30 to-white' : 'border-gray-200/80 hover:border-primary-300'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-3 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider border ${badge.style}`}
          >
            {badge.label}
          </span>

          <div className="flex items-baseline gap-1 text-right">
            <span className="text-xl font-black text-primary-600 tracking-tight">
              {request.expectedCreditAmount || request.expectedDurationMinutes || 60}
            </span>
            <span className="text-2xs font-bold text-gray-400 uppercase">Credit</span>
          </div>
        </div>

        {/* Title Linked to Detail Page */}
        <Link to={`/posts/learner/${request._id}`} className="block">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            {request.skillNeeded}
          </h3>
        </Link>

        {/* Short Summary Description */}
        {request.shortDescription ? (
          <p className="text-xs text-gray-600 font-medium line-clamp-3 mb-4 leading-relaxed">
            {request.shortDescription}
          </p>
        ) : request.description ? (
          <RichTextViewer content={request.description} className="line-clamp-3 mb-4" />
        ) : (
          <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            Cần tìm người hướng dẫn kiến thức môn {request.skillNeeded}, giải đáp bài tập và củng cố phương pháp.
          </p>
        )}

        {/* Desired Slots Preview Pills */}
        {request.desiredSlots && request.desiredSlots.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {request.desiredSlots.slice(0, 3).map((slot, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-3xs font-extrabold border border-primary-100"
              >
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {DAY_MAP[slot.dayOfWeek] || slot.dayOfWeek} {slot.startTime}
                </span>
              </span>
            ))}
            {request.desiredSlots.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-3xs font-bold">
                +{request.desiredSlots.length - 3} lịch khác
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Author Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            {request.learnerAvatar ? (
              <img
                src={request.learnerAvatar}
                alt={request.learnerName || 'Học viên'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(request.learnerName || 'H').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-gray-800 leading-tight">
                {request.learnerName || 'Học viên UniTime'}
              </div>
              <div className="flex items-center gap-1 text-3xs font-semibold text-gray-400 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-primary-500" />
                <span>HỌC VIÊN CỘNG ĐỒNG</span>
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

        {/* CTA Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/posts/learner/${request._id}`}
            className="py-2 px-3 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Link>

          <button
            type="button"
            onClick={() => onTeachClick?.(request)}
            className="py-2 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-2xs transition-colors flex items-center justify-center cursor-pointer"
          >
            <span>Đề nghị dạy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
