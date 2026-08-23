import React from 'react';
import { Search, X, Inbox } from 'lucide-react';
import type { BookingItem } from '@/core/api/booking/bookingApi';
import type { MessageFilterType, PartnerInfo } from '../../hooks/useMessagesManagement';
import { ConversationItem } from './ConversationItem';

interface ConversationSidebarProps {
  conversations: BookingItem[];
  selectedBookingId: string | null;
  onSelectBooking: (bookingId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: MessageFilterType;
  onFilterChange: (filter: MessageFilterType) => void;
  filterCounts?: Record<MessageFilterType, number>;
  getPartnerInfo: (booking: BookingItem) => PartnerInfo;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  selectedBookingId,
  onSelectBooking,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  filterCounts = {
    ACTIVE: 0,
    ALL: 0,
    CANCELLED: 0,
    COMPLETED: 0,
    MENTORS: 0,
    LEARNERS: 0,
  },
  getPartnerInfo,
}) => {
  return (
    <div className="lg:col-span-4 border-r border-slate-100 flex flex-col bg-white h-full min-h-0">
      {/* Header: Title + Neutral Segmented Tabs + Full-width Search */}
      <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Tin nhắn</h2>
        </div>

        {/* Modern Neutral Segmented Control (iOS / Linear style - No drop text, neutral colors) */}
        <div className="p-1 bg-slate-100/90 rounded-xl flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => onFilterChange('ACTIVE')}
            className={`flex-1 py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
              filterType === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <span className="whitespace-nowrap">Hoạt động</span>
            {filterCounts.ACTIVE > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filterType === 'ACTIVE'
                    ? 'bg-slate-100 text-slate-800 border border-slate-200/60'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {filterCounts.ACTIVE}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('COMPLETED')}
            className={`flex-1 py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
              filterType === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <span className="whitespace-nowrap">Đã xong</span>
            {filterCounts.COMPLETED > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filterType === 'COMPLETED'
                    ? 'bg-slate-100 text-slate-800 border border-slate-200/60'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {filterCounts.COMPLETED}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('CANCELLED')}
            className={`flex-1 py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
              filterType === 'CANCELLED'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <span className="whitespace-nowrap">Đã hủy</span>
            {filterCounts.CANCELLED > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filterType === 'CANCELLED'
                    ? 'bg-slate-100 text-slate-800 border border-slate-200/60'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {filterCounts.CANCELLED}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`flex-1 py-1.5 px-1 rounded-lg text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <span className="whitespace-nowrap">Tất cả</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterType === 'ALL'
                  ? 'bg-slate-100 text-slate-800 border border-slate-200/60'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {filterCounts.ALL}
            </span>
          </button>
        </div>

        {/* Full-width Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm người học hoặc bài dạy..."
            className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-50">
        {conversations.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400 my-auto flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-1">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">Không có cuộc trò chuyện nào</p>
            <p className="text-[11px] text-slate-400 max-w-[200px]">
              {searchQuery
                ? 'Không tìm thấy kết quả phù hợp với từ khóa.'
                : filterType === 'ACTIVE'
                ? 'Hiện chưa có buổi học nào đang diễn ra. Bạn có thể chọn tab "Tất cả" hoặc "Đã hủy" để xem lại.'
                : 'Chưa có dữ liệu trong danh mục này.'}
            </p>
          </div>
        ) : (
          conversations.map((booking) => {
            const partner = getPartnerInfo(booking);
            const isSelected = booking.id === selectedBookingId;

            return (
              <ConversationItem
                key={booking.id}
                booking={booking}
                partner={partner}
                isSelected={isSelected}
                onSelect={onSelectBooking}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
