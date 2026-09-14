import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/features/auth';
import { useGetMeQuery } from '@/core/api/user';
import {
  useJoinGroupRoomMutation,
  useLeaveGroupRoomMutation,
  useGetRoomChatMessagesQuery,
  useGetGroupRoomStatsQuery,
} from '@/core/api/session';
import {
  useLiveKitRoom,
  useSessionSocket,
  useInRoomChat,
  useWhiteboard,
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
  DeviceSettingsModal,
  SessionEndedModal,
  GroupEscrowModal,
} from '../components';
import { Loader2, AlertTriangle, ArrowLeft, PauseCircle, Clock } from 'lucide-react';
import { toast } from '@/shared/utils';

export const GroupRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });

  const [joinGroup, { data: tokenData, isLoading: isJoining, error: joinError }] =
    useJoinGroupRoomMutation();
  const [leaveGroup] = useLeaveGroupRoomMutation();

  const isHost = tokenData?.role === 'MENTOR';

  // Thống kê quỹ tạm giữ dành cho Host (Cập nhật theo dữ liệu thực tế)
  const {
    data: roomStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetGroupRoomStatsQuery(tokenData?.roomId || '', {
    skip: !tokenData?.roomId || !isHost,
  });

  const { data: initialMessages } = useGetRoomChatMessagesQuery(tokenData?.roomId || '', {
    skip: !tokenData?.roomId,
  });

  // Modals & States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEndedModalOpen, setIsEndedModalOpen] = useState(false);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);

  // Trạng thái hiện diện của Chủ phòng (Host) & Đóng băng phòng
  const [socketHostPresent, setSocketHostPresent] = useState<boolean | null>(null);
  const [hostAbsentSecondsRemaining, setHostAbsentSecondsRemaining] = useState<number>(300);
  const [roomEndReason, setRoomEndReason] = useState<{ title?: string; description?: string } | null>(null);
  const hostDisconnectedAtRef = useRef<number | null>(null);

  // Theo dõi số Credit đóng góp thời gian thực từ các học viên đang có mặt trong phòng
  const [liveLearnerEscrows, setLiveLearnerEscrows] = useState<
    Record<string, { activeSeconds: number; paidSeconds: number; credits: number }>
  >({});

  const displayName =
    userProfile?.displayName ||
    authUser?.email?.split('@')[0] ||
    'Người học';
  const avatarUrl = userProfile?.avatarUrl;

  const hostAccumulatedCredits = useMemo(() => {
    if (!isHost) return 0;
    const serverTotal = roomStats?.accumulatedCredits ?? 0;
    const liveTotal = Object.values(liveLearnerEscrows).reduce((sum, item) => sum + item.credits, 0);
    return Math.max(serverTotal, liveTotal);
  }, [isHost, roomStats?.accumulatedCredits, liveLearnerEscrows]);

  const mergedStats = useMemo(() => {
    if (!roomStats) return null;
    const learners = roomStats.learners.map((l) => {
      const live = liveLearnerEscrows[l.userId];
      if (live) {
        return {
          ...l,
          activeSeconds: Math.max(l.activeSeconds, live.activeSeconds),
          paidMinutes: Math.max(l.paidMinutes, Math.floor(live.paidSeconds / 60)),
          creditsContributed: Math.max(l.creditsContributed, live.credits),
        };
      }
      return l;
    });

    return {
      ...roomStats,
      accumulatedCredits: hostAccumulatedCredits,
      learners,
    };
  }, [roomStats, liveLearnerEscrows, hostAccumulatedCredits]);

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

  // Đồng bộ trạng thái hiện diện và đồng hồ đếm ngược phòng từ backend khi load xong tokenData
  useEffect(() => {
    if (tokenData && !isHost) {
      if (tokenData.isHostPresent !== undefined) {
        setSocketHostPresent(tokenData.isHostPresent);
      }
      if (tokenData.hostDisconnectedAt) {
        const absentMs = new Date(tokenData.hostDisconnectedAt).getTime();
        hostDisconnectedAtRef.current = absentMs;
        const elapsed = Math.floor((Date.now() - absentMs) / 1000);
        setHostAbsentSecondsRemaining(Math.max(0, 300 - elapsed));
      } else if (tokenData.hostAbsentSecondsRemaining !== undefined) {
        setHostAbsentSecondsRemaining(tokenData.hostAbsentSecondsRemaining);
      }
    }
  }, [tokenData, isHost]);

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

  // 5. Socket.IO Real-time Helper
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
    onEscrowMeteringUpdate: (data) => {
      if (isHost) {
        setLiveLearnerEscrows((prev) => ({
          ...prev,
          [data.userId]: data,
        }));
      }
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
    onHostPresenceChanged: (evt) => {
      setSocketHostPresent(evt.isHostPresent);
      if (evt.isHostPresent) {
        toast.success('Chủ phòng đã trở lại! Buổi học tiếp tục.');
        hostDisconnectedAtRef.current = null;
        setHostAbsentSecondsRemaining(300);
      } else {
        toast.warning(
          'Chủ phòng tạm vắng mặt',
          'Thời gian tính phí đã tạm dừng. Phòng sẽ tự đóng sau 5 phút nếu chủ phòng không quay lại.',
        );
        if (evt.absentSince) {
          const absentMs = new Date(evt.absentSince).getTime();
          hostDisconnectedAtRef.current = absentMs;
          const elapsed = Math.floor((Date.now() - absentMs) / 1000);
          setHostAbsentSecondsRemaining(Math.max(0, 300 - elapsed));
        } else if (evt.killCountdownSeconds) {
          hostDisconnectedAtRef.current = Date.now() - (300 - evt.killCountdownSeconds) * 1000;
          setHostAbsentSecondsRemaining(evt.killCountdownSeconds);
        } else {
          hostDisconnectedAtRef.current = Date.now();
          setHostAbsentSecondsRemaining(300);
        }
      }
    },
    onRoomClosed: (evt) => {
      setRoomEndReason({
        title: 'Phòng học đã kết thúc',
        description: evt.message || 'Phòng học nhóm đã tự động đóng do chủ phòng vắng mặt quá 5 phút.',
      });
      disconnect();
      setIsEndedModalOpen(true);
    },
  });

  // Kiểm tra sự hiện diện của Chủ phòng (Mentor)
  const isHostPresent = useMemo(() => {
    if (isHost) return true;
    if (!tokenData) return true;

    // 1. Socket presence là nguồn sự kiện cập nhật thời gian thực
    if (socketHostPresent !== null) {
      return socketHostPresent;
    }

    // 2. Dữ liệu từ session API khi vừa join phòng
    if (tokenData.isHostPresent !== undefined) {
      return tokenData.isHostPresent;
    }

    // 3. Mặc định là true khi đang kết nối, không tự ý hiện banner vắng mặt
    return true;
  }, [isHost, tokenData, socketHostPresent]);

  // Bộ đếm ngược 5 phút (300 giây) tự động giải tán phòng khi Host vắng mặt
  useEffect(() => {
    if (isHost || isHostPresent) return;

    const timer = setInterval(() => {
      setHostAbsentSecondsRemaining((prev) => {
        let remaining = prev - 1;
        if (hostDisconnectedAtRef.current) {
          const elapsed = Math.floor((Date.now() - hostDisconnectedAtRef.current) / 1000);
          remaining = Math.max(0, 300 - elapsed);
        }

        if (remaining <= 0) {
          clearInterval(timer);
          setRoomEndReason({
            title: 'Phòng học nhóm đã kết thúc',
            description:
              'Chủ phòng (Mentor) đã vắng mặt quá 5 phút. Buổi học đã tự động đóng để đảm bảo quyền lợi và không trừ credit của bạn.',
          });
          disconnect();
          setIsEndedModalOpen(true);
          return 0;
        }
        return remaining;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHost, isHostPresent, disconnect]);

  // 7. Session Billing Timer Hook (Optimistic Metering)
  // Khi isHostPresent = false, đồng hồ ĐÓNG BĂNG, không tăng giây và không trừ credit
  const heartbeatHelper = useHeartbeat({
    roomId: tokenData?.roomId,
    isGroupRoom: true,
    isLearner: tokenData?.role === 'LEARNER',
    isFrozen: !isHostPresent,
    initialBalance:
      tokenData?.availableBalance ??
      (authUser as any)?.wallet?.availableBalance ??
      0,
    initialActiveSeconds: tokenData?.activeSeconds ?? 0,
    initialCreditsCharged: tokenData?.creditsCharged ?? 0,
    onTick: (data) => {
      socketHelper.sendMeteringTick(data.activeSeconds, data.paidSeconds, data.credits);
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
        isHost={isHost}
        hostAccumulatedCredits={hostAccumulatedCredits}
        onOpenEscrowModal={() => {
          refetchStats();
          setIsEscrowModalOpen(true);
        }}
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

      {/* Banner Đóng băng thời gian khi Chủ phòng vắng mặt */}
      {!isHost && !isHostPresent && (
        <div className="w-full bg-amber-50/90 border-b border-amber-200/90 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none z-20 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <PauseCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Thời gian đang tạm dừng</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[11px] font-semibold text-amber-800">
                  Tạm dừng tính phí
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                Chủ phòng (Mentor) đang tạm vắng mặt. Hệ thống không trừ credit của bạn trong thời gian này.
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xs transition-colors shrink-0 ${
              hostAbsentSecondsRemaining <= 60
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-amber-200 text-slate-700'
            }`}
          >
            <Clock
              className={`w-3.5 h-3.5 shrink-0 ${
                hostAbsentSecondsRemaining <= 60 ? 'text-rose-600 animate-pulse' : 'text-amber-600'
              }`}
            />
            <span className="text-xs font-medium">Tự động hủy phòng sau:</span>
            <span
              className={`font-mono text-xs font-bold tracking-wide ${
                hostAbsentSecondsRemaining <= 60 ? 'text-rose-700' : 'text-amber-800'
              }`}
            >
              {String(Math.floor(hostAbsentSecondsRemaining / 60)).padStart(2, '0')}:
              {String(hostAbsentSecondsRemaining % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

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
        unreadCount={unreadCount}
        onToggleMic={toggleMicrophone}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onToggleChat={toggleChat}
        onToggleWhiteboard={() => setIsWhiteboardOpen((prev) => !prev)}
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

      {/* 5. Settings Modal */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 7. Ended Modal */}
      <SessionEndedModal
        isOpen={isEndedModalOpen}
        creditsTransferred={heartbeatHelper.totalCreditsCharged}
        isHost={tokenData?.role === 'MENTOR'}
        title={roomEndReason?.title}
        description={roomEndReason?.description}
      />

      {/* 8. Group Escrow & Participant Breakdown Modal (Host) */}
      <GroupEscrowModal
        isOpen={isEscrowModalOpen}
        onClose={() => setIsEscrowModalOpen(false)}
        stats={mergedStats}
        isLoading={isLoadingStats}
        onRefresh={refetchStats}
      />
    </div>
  );
};
