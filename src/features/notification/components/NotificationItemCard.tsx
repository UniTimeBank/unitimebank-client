import React from 'react';
import type { NotificationItem } from '../types';
import { NotificationAvatar } from './NotificationAvatar';
import { formatRelativeTime } from '../utils';

interface NotificationItemCardProps {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start ${
        !item.isRead ? 'bg-primary-50/20' : 'bg-white'
      }`}
    >
      {/* Visual Avatar / Distinct Format */}
      <NotificationAvatar item={item} />

      {/* Notification Content (Clean & minimal) */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <p
            className={`text-xs leading-snug truncate ${
              !item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
            }`}
          >
            {item.notification?.title || 'Thông báo từ hệ thống'}
          </p>
          {!item.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
          {item.notification?.body}
        </p>
        <p className="text-[10px] text-slate-400 pt-0.5">
          {formatRelativeTime(item.createdAt || item.notification?.createdAt)}
        </p>
      </div>
    </div>
  );
};
