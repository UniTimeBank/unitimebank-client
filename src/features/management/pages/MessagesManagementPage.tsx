import React from 'react';
import { MessageSquare } from 'lucide-react';

export const MessagesManagementPage: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HEADER BAR INSIDE CARD */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Hộp thư Tin nhắn
          </h2>
          <p className="text-xs text-slate-500">
            Hộp thư trao đổi trực tiếp giữa Người dạy và Học viên về nội dung buổi học.
          </p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-gray-50/50 rounded-2xl p-12 border border-dashed border-gray-200 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Chưa có cuộc trò chuyện nào</h3>
        <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
          Khi một booking được xác nhận, phòng chat riêng giữa bạn và đối tác học tập sẽ được kích hoạt tại đây.
        </p>
      </div>
    </div>
  );
};
