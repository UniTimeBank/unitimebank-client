import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  InRoomChatMessage,
  WhiteboardPayload,
  CodeEditorPayload,
  ParticipantMutedEvent,
  ParticipantKickedEvent,
  HeartbeatAckEvent,
} from '../types';

export interface UseSessionSocketProps {
  roomId?: string;
  userId?: string;
  role?: string;
  displayName?: string;
  onNewMessage?: (msg: InRoomChatMessage) => void;
  onWhiteboardUpdate?: (payload: WhiteboardPayload) => void;
  onCodeEditorUpdate?: (payload: CodeEditorPayload) => void;
  onNoteUpdate?: (content: string) => void;
  onParticipantMuted?: (evt: ParticipantMutedEvent) => void;
  onParticipantKicked?: (evt: ParticipantKickedEvent) => void;
  onHeartbeatAck?: (ack: HeartbeatAckEvent) => void;
}

export const useSessionSocket = ({
  roomId,
  userId,
  role,
  displayName,
  onNewMessage,
  onWhiteboardUpdate,
  onCodeEditorUpdate,
  onNoteUpdate,
  onParticipantMuted,
  onParticipantKicked,
  onHeartbeatAck,
}: UseSessionSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Keep callbacks stable across renders to prevent infinite re-connection loops
  const callbacksRef = useRef({
    onNewMessage,
    onWhiteboardUpdate,
    onCodeEditorUpdate,
    onNoteUpdate,
    onParticipantMuted,
    onParticipantKicked,
    onHeartbeatAck,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewMessage,
      onWhiteboardUpdate,
      onCodeEditorUpdate,
      onNoteUpdate,
      onParticipantMuted,
      onParticipantKicked,
      onHeartbeatAck,
    };
  });

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('accessToken');
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const origin = rawApiUrl.startsWith('http')
      ? new URL(rawApiUrl).origin
      : window.location.origin;

    const socket = io(`${origin}/sessions`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join Room
      socket.emit('join-room', {
        roomId,
        userId,
        role: role || 'LEARNER',
        displayName,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // In-room Chat
    socket.on('new-room-message', (msg: InRoomChatMessage) => {
      callbacksRef.current.onNewMessage?.(msg);
    });

    // Whiteboard Sync
    socket.on('whiteboard-update', (data: WhiteboardPayload) => {
      callbacksRef.current.onWhiteboardUpdate?.(data);
    });

    // Code Editor Sync
    socket.on('code-editor-update', (data: CodeEditorPayload) => {
      callbacksRef.current.onCodeEditorUpdate?.(data);
    });

    // Shared Note Sync
    socket.on('note-update', (content: string) => {
      callbacksRef.current.onNoteUpdate?.(content);
    });

    // Moderation
    socket.on('participant-muted', (evt: ParticipantMutedEvent) => {
      callbacksRef.current.onParticipantMuted?.(evt);
    });

    socket.on('participant-kicked', (evt: ParticipantKickedEvent) => {
      callbacksRef.current.onParticipantKicked?.(evt);
    });

    // Heartbeat ack
    socket.on('heartbeat-ack', (ack: HeartbeatAckEvent) => {
      callbacksRef.current.onHeartbeatAck?.(ack);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leave-room', { roomId, userId });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userId, role, displayName]);

  // Send shared note update
  const sendNoteUpdate = useCallback(
    (content: string) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('note-update', { roomId, content });
    },
    [roomId],
  );

  // Send message
  const sendMessage = useCallback(
    (
      content: string,
      senderName?: string,
      senderAvatar?: string,
      attachmentUrl?: string,
      attachmentName?: string,
    ) => {
      if (!socketRef.current || !roomId || (!content.trim() && !attachmentUrl)) return;
      socketRef.current.emit('send-room-message', {
        roomId,
        userId,
        content,
        senderName,
        senderAvatar,
        attachmentUrl,
        attachmentName,
      });
    },
    [roomId, userId],
  );

  // Send whiteboard stroke
  const sendWhiteboardDraw = useCallback(
    (drawData: WhiteboardPayload) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('whiteboard-draw', { roomId, drawData });
    },
    [roomId],
  );

  // Send code editor change
  const sendCodeEditorChange = useCallback(
    (code: string, language?: string) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('code-editor-change', {
        roomId,
        code,
        language: language || 'javascript',
      });
    },
    [roomId],
  );

  // Send Heartbeat ping
  const sendHeartbeat = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('heartbeat', { roomId, userId });
  }, [roomId, userId]);

  // Host Mute participant
  const muteParticipant = useCallback(
    (participantId: string, isMuted = true) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('mute-participant', {
        roomId,
        participantId,
        isMuted,
      });
    },
    [roomId],
  );

  // Host Kick participant
  const kickParticipant = useCallback(
    (participantId: string, reason?: string) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('kick-participant', {
        roomId,
        participantId,
        reason,
      });
    },
    [roomId],
  );

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    sendNoteUpdate,
    sendWhiteboardDraw,
    sendCodeEditorChange,
    sendHeartbeat,
    muteParticipant,
    kickParticipant,
  };
};
