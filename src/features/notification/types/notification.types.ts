export interface NotificationDetail {
  id: string;
  kind: string;
  title: string;
  body: string;
  sourceEvent?: string;
  payloadRef?: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  notification: NotificationDetail;
}

export interface GetMyNotificationsResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
