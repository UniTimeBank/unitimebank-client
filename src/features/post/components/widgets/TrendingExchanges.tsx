import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_TRENDING } from '../../constants';

export const TrendingExchanges: React.FC = () => {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-primary-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Trao Đổi Nổi Bật</h2>
        </div>
        <Link
          to="/requests"
          className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEFAULT_TRENDING.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  {item.category}
                </span>
                <span className="inline-flex items-center gap-1 text-3xs font-bold text-primary-600">
                  <Zap className="w-3 h-3 fill-primary-500 text-primary-500" />
                  {item.duration}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
              <img
                src={item.avatar}
                alt={item.mentorName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-100"
              />
              <span className="text-xs font-bold text-gray-800">
                {item.mentorName} <span className="text-gray-400 font-normal">•</span> {item.rating} ★
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
