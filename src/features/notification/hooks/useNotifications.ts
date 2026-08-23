import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/core/api/notification/notificationApi';
import type { NotificationItem } from '../types';
import { getNotificationSocket } from '../utils';
import { ROUTES } from '@/routes/paths';

export const useNotifications = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // RTK Query with 15s fallback polling
  const { data: unreadData, refetch: refetchUnread } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 15000,
  });
  const {
    data: notifData,
    isLoading,
    refetch: refetchNotifs,
  } = useGetMyNotificationsQuery(
    { limit: 25, unreadOnly: filterUnreadOnly },
    {
      pollingInterval: 15000,
    },
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.unreadCount ?? notifData?.unreadCount ?? 0;
  const notifications = notifData?.items || [];

  // Realtime Socket.IO Connection listener for 0ms live notification updates
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = getNotificationSocket(token);
    if (!socket) return;

    const handleRealtimeNotification = () => {
      refetchUnread();
      refetchNotifs();
    };

    socket.on('notification:new', handleRealtimeNotification);
    socket.on('notification:update', handleRealtimeNotification);

    return () => {
      socket.off('notification:new', handleRealtimeNotification);
      socket.off('notification:update', handleRealtimeNotification);
    };
  }, [refetchUnread, refetchNotifs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id).catch(() => {});
    }

    setIsOpen(false);

    // Smart redirect based on notification kind / source
    const notif = item.notification;
    const kind = (notif?.kind || '').toUpperCase();
    const sourceEvent = (notif?.sourceEvent || '').toUpperCase();
    const payloadRef = notif?.payloadRef;

    // 1. Chat & Direct Messages ONLY:
    if (
      kind === 'CHAT_MESSAGE' ||
      kind === 'BOOKING_MESSAGE' ||
      sourceEvent === 'CHAT_MESSAGE' ||
      sourceEvent === 'BOOKING_MESSAGE' ||
      (kind.includes('CHAT') && !kind.includes('BOOKING_'))
    ) {
      if (payloadRef) {
        navigate(`/manage/messages?bookingId=${payloadRef}`);
      } else {
        navigate(ROUTES.MANAGE.MESSAGES);
      }
      return;
    }

    // 2. Booking events (Yêu cầu đặt lịch, chấp nhận, hủy, từ chối, hoàn tất...):
    if (kind.includes('BOOKING') || sourceEvent.includes('BOOKING')) {
      let targetTab: 'PENDING' | 'UPCOMING' | 'HISTORY' = 'PENDING';

      if (
        kind === 'BOOKING_CREATED' ||
        kind === 'BOOKING_REQUEST' ||
        kind === 'BOOKING_OFFER' ||
        sourceEvent.includes('REQUEST') ||
        sourceEvent.includes('OFFER')
      ) {
        targetTab = 'PENDING';
      } else if (
        kind === 'BOOKING_ACCEPTED' ||
        kind === 'BOOKING_CONFIRMED' ||
        kind === 'BOOKING_STARTED' ||
        sourceEvent.includes('ACCEPTED') ||
        sourceEvent.includes('CONFIRMED') ||
        sourceEvent.includes('STARTED')
      ) {
        targetTab = 'UPCOMING';
      } else if (
        kind === 'BOOKING_COMPLETED' ||
        kind === 'BOOKING_CANCELLED' ||
        kind === 'BOOKING_REJECTED' ||
        kind === 'BOOKING_NO_SHOW' ||
        sourceEvent.includes('COMPLETED') ||
        sourceEvent.includes('CANCEL') ||
        sourceEvent.includes('REJECT') ||
        sourceEvent.includes('NO_SHOW')
      ) {
        targetTab = 'HISTORY';
      }

      if (payloadRef) {
        navigate(`/manage/bookings?tab=${targetTab}&bookingId=${payloadRef}`);
      } else {
        navigate(`/manage/bookings?tab=${targetTab}`);
      }
      return;
    }

    // 3. Post events:
    if (kind.includes('POST') || sourceEvent.includes('POST')) {
      if (payloadRef) {
        navigate(`/posts/mentor/${payloadRef}`);
      } else {
        navigate(ROUTES.EXPLORE);
      }
      return;
    }

    // 4. Wallet / Check-in Streak / Reward:
    if (
      kind.includes('WALLET') ||
      kind.includes('STREAK') ||
      kind.includes('REWARD') ||
      sourceEvent.includes('WALLET') ||
      sourceEvent.includes('STREAK')
    ) {
      navigate(ROUTES.MANAGE.WALLET);
      return;
    }

    // 5. User registered / account:
    if (kind.includes('USER') || sourceEvent.includes('USER')) {
      navigate(ROUTES.PROFILE);
      return;
    }

    // 6. Default fallback:
    if (payloadRef) {
      navigate(`/manage/messages?bookingId=${payloadRef}`);
    } else {
      navigate(ROUTES.MANAGE.BOOKINGS);
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    try {
      await markAllAsRead().unwrap();
    } catch {}
  };

  return {
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
  };
};
