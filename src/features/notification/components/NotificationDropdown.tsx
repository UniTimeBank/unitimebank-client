import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks';
import { NotificationItemCard } from './NotificationItemCard';

export const NotificationDropdown: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    filterUnreadOnly,
    setFilterUnreadOnly,
    dropdownRef,
    unreadCount,
    notifications,
    isLoading,
    isMarkingAll,
    handleNotificationClick,
    handleMarkAll,
  } = useNotifications();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all cursor-pointer shrink-0 flex items-center justify-center"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-1.5 ring-white leading-none pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 flex flex-col max-h-[500px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Dropdown Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thông báo</h3>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                className="text-[11px] font-bold text-primary-700 hover:text-primary-800 hover:underline cursor-pointer transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Minimalist Segmented Filter Tabs */}
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 shrink-0 bg-white">
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${!filterUnreadOnly
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${filterUnreadOnly
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">Không có thông báo nào</p>
                <p className="text-[11px] text-slate-400">
                  {filterUnreadOnly
                    ? 'Bạn đã đọc tất cả thông báo.'
                    : 'Khi có hoạt động mới về lịch học hoặc tin nhắn, hệ thống sẽ gửi thông báo tại đây.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <NotificationItemCard
                  key={item.id}
                  item={item}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
