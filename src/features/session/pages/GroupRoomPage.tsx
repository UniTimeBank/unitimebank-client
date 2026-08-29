import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/features/auth';
import { useGetMeQuery } from '@/core/api/user';
import {
  useJoinGroupRoomMutation,
  useLeaveGroupRoomMutation,
  useGetRoomChatMessagesQuery,
} from '@/core/api/session';
import {
  useLiveKitRoom,
  useSessionSocket,
  useInRoomChat,
  useWhiteboard,
  useCodeEditor,
  useHeartbeat,
} from '../hooks';
import type { InRoomChatMessage } from '../types';
import {
  SessionHeader,
  SessionControlsBar,
  VideoGrid,
  ScreenShareView,
  InRoomChatPanel,
  WhiteboardModal,
  LiveCodeEditorModal,
  DeviceSettingsModal,
  SessionEndedModal,
} from '../components';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from '@/shared/utils';

export const GroupRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });

  const [joinGroup, { data: tokenData, isLoading: isJoining, error: joinError }] =
    useJoinGroupRoomMutation();
  const [leaveGroup] = useLeaveGroupRoomMutation();

  const { data: initialMessages } = useGetRoomChatMessagesQuery(tokenData?.roomId || '', {
    skip: !tokenData?.roomId,
  });

  // Modals & States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEndedModalOpen, setIsEndedModalOpen] = useState(false);

  const displayName =
    userProfile?.displayName ||
    authUser?.email?.split('@')[0] ||
    'Người học';
  const avatarUrl = userProfile?.avatarUrl;

  // 1. Initial Join Group Room
  useEffect(() => {
    if (roomId) {
      joinGroup(roomId)
        .unwrap()
        .catch((err) => {
          console.error('Failed to join group room:', err);
        });
    }
  }, [roomId, joinGroup]);

  // 2. WebRTC LiveKit
  // 3. In-Room Chat
  const {
    messages,
    unreadCount,
    isChatOpen,
    addMessage,
    toggleChat,
    closeChat,
  } = useInRoomChat(initialMessages || []);

  const {
    localParticipant,
    remoteParticipants,
    activeSpeakers,
    screenShareTrack,
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    disconnect,
  } = useLiveKitRoom({
    wsUrl: tokenData?.livekitWsUrl,
    token: tokenData?.livekitToken,
    autoConnect: !!tokenData?.livekitToken,
    onDisconnected: () => {
      setIsEndedModalOpen(true);
    },
  });

  // 4. Whiteboard
  const {
    elements: whiteboardElements,
    currentTool,
    currentColor,
    currentWidth,
    isWhiteboardOpen,
    setCurrentTool,
    setCurrentColor,
    setCurrentWidth,
    setIsWhiteboardOpen,
    addElement: addWhiteboardElement,
    clearBoard: clearWhiteboard,
    undo: undoWhiteboard,
    handleRemoteUpdate: handleRemoteWhiteboardUpdate,
  } = useWhiteboard((payload) => {
    socketHelper.sendWhiteboardDraw(payload);
  });

  // 5. Code Editor
  const {
    code: editorCode,
    language: editorLanguage,
    isEditorOpen,
    setIsEditorOpen,
    updateCode: updateEditorCode,
    updateLanguage: updateEditorLanguage,
    handleRemoteUpdate: handleRemoteEditorUpdate,
  } = useCodeEditor((payload) => {
    socketHelper.sendCodeEditorChange(payload.code, payload.language);
  });

  // 6. Socket.IO Real-time Helper
  const socketHelper = useSessionSocket({
    roomId: tokenData?.roomId,
    userId: authUser?.id,
    role: tokenData?.role,
    displayName,
    onNewMessage: (msg) => {
      addMessage(msg);
    },
    onWhiteboardUpdate: (data) => {
      handleRemoteWhiteboardUpdate(data);
    },
    onCodeEditorUpdate: (data) => {
      handleRemoteEditorUpdate(data);
    },
    onHeartbeatAck: (ack) => {
      heartbeatHelper.handleHeartbeatAck(ack);
    },
    onParticipantMuted: (evt) => {
      if (evt.userId === authUser?.id && evt.isMuted) {
        toast.info('Host đã tắt microphone của bạn.');
      }
    },
    onParticipantKicked: (evt) => {
      if (evt.userId === authUser?.id) {
        toast.error('Bạn đã bị mời ra khỏi phòng học nhóm.');
        disconnect();
        navigate('/rooms/group');
      }
    },
  });

  // 7. Heartbeat Hook (60s tick for group rooms)
  const heartbeatHelper = useHeartbeat({
    roomId: tokenData?.roomId,
    isGroupRoom: true,
    isLearner: tokenData?.role === 'LEARNER',
    onHeartbeat: () => {
      socketHelper.sendHeartbeat();
    },
    onInsufficientBalance: () => {
      disconnect();
      navigate('/manage/wallet');
    },
  });

  // 8. Leave Group Call
  const handleLeaveGroup = useCallback(async () => {
    if (roomId) {
      try {
        await leaveGroup(roomId).unwrap();
      } catch (err) {
        console.error('Error leaving group room:', err);
      }
    }
    disconnect();
    navigate('/rooms/group');
  }, [roomId, leaveGroup, disconnect, navigate]);

  // Loading Screen
  if (isJoining) {
    return (
      <div className="fixed inset-0 w-full h-full bg-slate-50 flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-200 z-50">
        <div className="w-16 h-16 rounded-3xl bg-primary-50 border border-primary-200/80 flex items-center justify-center mb-4 shadow-sm">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Đang vào phòng học nhóm...</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">
          Đang kết nối luồng WebRTC và kiểm tra trạng thái số dư ví...
        </p>
      </div>
    );
  }

  // Error Screen
  if (joinError) {
    const errorMessage =
      (joinError as any)?.data?.message || 'Không thể tham gia phòng học nhóm này.';
    return (
      <div className="fixed inset-0 w-full h-full bg-slate-50 flex flex-col items-center justify-center text-center p-6 select-none z-50">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center mx-auto text-rose-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Lỗi tham gia phòng nhóm</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => navigate('/manage/bookings')}
            className="w-full py-2.5 px-4 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách phòng</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-100 flex flex-col overflow-hidden select-none z-40">
      {/* 1. Header */}
      <SessionHeader
        title="Phòng học nhóm trực tuyến"
        roomType="GROUP"
        participantCount={1 + remoteParticipants.length}
        currentBalance={
          tokenData?.role === 'LEARNER'
            ? (heartbeatHelper.currentBalance ?? tokenData.availableBalance)
            : undefined
        }
        freeSecondsRemaining={
          tokenData?.role === 'LEARNER'
            ? heartbeatHelper.freeSecondsRemaining
            : undefined
        }
        paidSeconds={
          tokenData?.role === 'LEARNER'
            ? heartbeatHelper.paidSeconds
            : undefined
        }
        totalCreditsCharged={
          tokenData?.role === 'LEARNER'
            ? heartbeatHelper.totalCreditsCharged
            : undefined
        }
        onLeave={handleLeaveGroup}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative h-full flex flex-col items-center justify-center p-2 pb-24 md:pb-28">
          {screenShareTrack ? (
            /* Screen Share Spotlight */
            <div className="w-full h-full max-w-7xl mx-auto">
              <ScreenShareView
                screenTrack={screenShareTrack.track}
                participantIdentity={screenShareTrack.participantIdentity}
              />
            </div>
          ) : (
            /* Group Video Grid */
            <VideoGrid
              localParticipant={localParticipant}
              remoteParticipants={remoteParticipants}
              activeSpeakers={activeSpeakers}
              mentorId={tokenData?.mentorId}
              currentUserId={authUser?.id}
              is1on1={false}
              onMuteParticipant={(id) => socketHelper.muteParticipant(id, true)}
              onKickParticipant={(id) => socketHelper.kickParticipant(id, 'Vi phạm quy định')}
            />
          )}
        </div>

        {/* Chat Sidebar */}
        <InRoomChatPanel
          isOpen={isChatOpen}
          messages={messages}
          currentUserId={authUser?.id}
          onClose={closeChat}
          onSendMessage={(content) => {
            const newMsg: InRoomChatMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              roomId: roomId || '',
              senderId: authUser?.id || '',
              senderName: displayName,
              senderAvatar: avatarUrl,
              content,
              sentAt: new Date().toISOString(),
            };
            addMessage(newMsg);
            socketHelper.sendMessage(content, displayName, avatarUrl);
          }}
        />
      </main>

      {/* 3. Controls Bar */}
      <SessionControlsBar
        isMicEnabled={isMicEnabled}
        isCameraEnabled={isCameraEnabled}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        isWhiteboardOpen={isWhiteboardOpen}
        isEditorOpen={isEditorOpen}
        unreadCount={unreadCount}
        onToggleMic={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={toggleChat}
        onToggleWhiteboard={() => setIsWhiteboardOpen((prev) => !prev)}
        onToggleEditor={() => setIsEditorOpen((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeave={handleLeaveGroup}
      />

      {/* 4. Whiteboard Modal */}
      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        elements={whiteboardElements}
        currentTool={currentTool}
        currentColor={currentColor}
        currentWidth={currentWidth}
        onClose={() => setIsWhiteboardOpen(false)}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onWidthChange={setCurrentWidth}
        onAddElement={addWhiteboardElement}
        onClear={clearWhiteboard}
        onUndo={undoWhiteboard}
      />

      {/* 5. Live Code Editor Modal */}
      <LiveCodeEditorModal
        isOpen={isEditorOpen}
        code={editorCode}
        language={editorLanguage}
        onClose={() => setIsEditorOpen(false)}
        onCodeChange={updateEditorCode}
        onLanguageChange={updateEditorLanguage}
      />

      {/* 6. Settings Modal */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 7. Ended Modal */}
      <SessionEndedModal
        isOpen={isEndedModalOpen}
        creditsTransferred={heartbeatHelper.totalCreditsCharged}
        isHost={tokenData?.role === 'MENTOR'}
      />
    </div>
  );
};
