import { useState, useCallback, useEffect } from 'react';
import type { InRoomChatMessage } from '../types';

export const useInRoomChat = (initialMessages: InRoomChatMessage[] = []) => {
  const [messages, setMessages] = useState<InRoomChatMessage[]>(initialMessages);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages((prev) => {
        const map = new Map<string, InRoomChatMessage>();
        initialMessages.forEach((m) => {
          const key = m.id || `${m.senderId}_${m.sentAt}`;
          map.set(key, m);
        });
        prev.forEach((m) => {
          const key = m.id || `${m.senderId}_${m.sentAt}`;
          map.set(key, m);
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
        );
      });
    }
  }, [initialMessages]);

  const addMessage = useCallback(
    (msg: InRoomChatMessage) => {
      setMessages((prev) => {
        // avoid duplicate id or content+sender match
        if (
          prev.some(
            (m) =>
              (m.id && msg.id && m.id === msg.id) ||
              (m.senderId === msg.senderId &&
                m.content === msg.content &&
                Math.abs(new Date(m.sentAt).getTime() - new Date(msg.sentAt).getTime()) < 2000),
          )
        ) {
          return prev;
        }
        return [...prev, msg];
      });

      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    [isChatOpen],
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  const openChat = useCallback(() => {
    setIsChatOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return {
    messages,
    unreadCount,
    isChatOpen,
    addMessage,
    toggleChat,
    openChat,
    closeChat,
  };
};
export default useInRoomChat;
