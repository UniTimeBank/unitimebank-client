import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/features/auth';
import { useGetMeQuery } from '@/core/api/user';
import {
  useJoinOneOnOneRoomMutation,
  useGetRoomChatMessagesQuery,
} from '@/core/api/session';
import {
  useGetBookingByIdQuery,
  useCompleteBookingMutation,
} from '@/core/api/booking';
import { useLiveKitRoom, useSessionSocket, useInRoomChat } from '../hooks';
import type { InRoomChatMessage } from '../types';
import type { DirectUploadAsset } from '@/core/api/upload';
import {
  SessionHeader,
  OneOnOneSpotlightVideo,
  OneOnOneSessionSidebar,
  DeviceSettingsModal,
  AudioTrackRenderer,
} from '../components';
import { Modal, Button } from '@/shared/components/ui';
import { Loader2, AlertCircle, ArrowLeft, LogOut } from 'lucide-react';
import { toast } from '@/shared/utils';

export const OneOnOneRoomPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });

  const [joinRoom, { data: tokenData, isLoading: isJoining, error: joinError }] =
    useJoinOneOnOneRoomMutation();

  const { data: bookingDetail, isLoading: isBookingLoading } = useGetBookingByIdQuery(
    bookingId || '',
    {
      skip: !bookingId,
    },
  );

  // Modals & UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const displayName =
    userProfile?.displayName ||
    authUser?.email?.split('@')[0] ||
    'Thành viên';
  const avatarUrl = userProfile?.avatarUrl;

  // 1. Initial Join Call
  useEffect(() => {
    if (bookingId) {
      joinRoom(bookingId)
        .unwrap()
        .catch((err) => {
          console.error('Join room failed:', err);
          toast.error(err?.data?.message || 'Không thể tham gia phòng học.');
        });
    }
  }, [bookingId, joinRoom]);

  // 2. In-Room Chat Data & Socket Integration
  const { data: initialMessages = [] } = useGetRoomChatMessagesQuery(
    tokenData?.roomId || '',
    {
      skip: !tokenData?.roomId,
      refetchOnMountOrArgChange: true,
    },
  );

  const { messages, addMessage } = useInRoomChat(initialMessages);

  const handleNewMessage = useCallback(
    (msg: InRoomChatMessage) => {
      addMessage(msg);
    },
    [addMessage],
  );

  // 3. WebRTC LiveKit Hook (Video, Audio & Direct P2P Chat Sync)
  const {
    localParticipant,
    remoteParticipants,
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
    onDataReceived: handleNewMessage,
    onDisconnected: () => {
      toast.info('Bạn đã rời khỏi phòng học.');
      navigate('/management/classes');
    },
  });

  const { sendMessage } = useSessionSocket({
    roomId: tokenData?.roomId,
    userId: authUser?.id,
    role: tokenData?.role,
    displayName,
    onNewMessage: handleNewMessage,
  });

  const handleSendMessage = useCallback(
    (
      content: string,
      attachmentUrl?: string,
      attachmentName?: string,
      attachmentAsset?: DirectUploadAsset,
    ) => {
      const newMsg: InRoomChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        roomId: tokenData?.roomId || bookingId || '',
        senderId: authUser?.id || '',
        senderName: displayName,
        senderAvatar: avatarUrl,
        content,
        attachmentUrl,
        attachmentName,
        sentAt: new Date().toISOString(),
      };

      // 1. Hiển thị ngay trên UI người gửi
      addMessage(newMsg);

      // 2. Socket.IO là kênh realtime duy nhất và backend lưu message vào database.
      sendMessage(
        content,
        displayName,
        avatarUrl,
        attachmentUrl,
        attachmentName,
        attachmentAsset?.publicId,
        attachmentAsset?.resourceType,
      );
    },
    [
      tokenData,
      bookingId,
      authUser,
      displayName,
      avatarUrl,
      addMessage,
      sendMessage,
    ],
  );

  // 4. Partner Identification
  const isMentor = useMemo(() => {
    if (tokenData?.role) return tokenData.role === 'MENTOR';
    return String(bookingDetail?.mentorId) === String(authUser?.id);
  }, [tokenData, bookingDetail, authUser]);

  const partnerName = isMentor
    ? bookingDetail?.learnerName || 'Học viên'
    : bookingDetail?.mentorName || 'Gia sư / Mentor';

  const partnerAvatar = isMentor
    ? bookingDetail?.learnerAvatar
    : bookingDetail?.mentorAvatar;

  const remoteParticipant = remoteParticipants[0];

  // 5. Real-time Countdown Timer calculation
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scheduledStart = bookingDetail?.scheduledStart
    ? new Date(bookingDetail.scheduledStart).getTime()
    : Date.now();

  const scheduledEnd = bookingDetail?.scheduledEnd
    ? new Date(bookingDetail.scheduledEnd).getTime()
    : scheduledStart + (bookingDetail?.durationMinutes || 60) * 60 * 1000;

  const totalDurationMs = Math.max(1000, scheduledEnd - scheduledStart);
  const totalDurationMinutes = Math.round(totalDurationMs / (60 * 1000));

  const remainingMs = Math.max(0, scheduledEnd - now);
  const elapsedMs = Math.max(0, now - scheduledStart);
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));

  const remainingMinutes = Math.floor(remainingMs / (60 * 1000));
  const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
  const remainingTimeFormatted = `${String(remainingMinutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;

  // 6. Auto-finish and exit when remaining time expires
  const [completeBookingMutation] = useCompleteBookingMutation();
  const [hasAutoEnded, setHasAutoEnded] = useState(false);

  useEffect(() => {
    if (bookingDetail?.scheduledEnd && !hasAutoEnded && !isJoining) {
      const endTime = new Date(bookingDetail.scheduledEnd).getTime();
      if (Date.now() >= endTime) {
        setHasAutoEnded(true);
        toast.info('Thời gian buổi học đã kết thúc. Đang lưu kết quả và chuyển về trang quản lý...');
        if (bookingId) {
          completeBookingMutation(bookingId)
            .unwrap()
            .catch((err) => {
              console.warn('Auto-complete booking call error:', err);
            });
        }
        disconnect();
        const timeout = setTimeout(() => {
          navigate('/management/classes');
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [now, bookingDetail, hasAutoEnded, isJoining, disconnect, navigate, bookingId, completeBookingMutation]);

  // 7. Safe Leave Room handler with Shared Modal
  const handleLeaveRoom = () => {
    setIsLeaveModalOpen(true);
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    disconnect();
    navigate('/management/classes');
  };

  // ════════════════════════════════════════════════════════════
  // LOADING / ERROR STATES
  // ════════════════════════════════════════════════════════════
  if (isJoining || isBookingLoading) {
    return (
      <div className="w-screen h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-primary-50 border border-primary-200/80 flex items-center justify-center mb-4 shadow-sm">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Đang kết nối vào phòng học trực tuyến...</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">Vui lòng chờ trong giây lát...</p>
      </div>
    );
  }

  if (joinError) {
    const errorMsg =
      (joinError as any)?.data?.message ||
      'Không thể tham gia phòng học trực tuyến. Vui lòng thử lại sau.';
    return (
      <div className="w-screen h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Không thể vào phòng học</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/manage/bookings')}
            className="w-full py-2.5 px-4 rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang quản lý</span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // MAIN FULL-SCREEN UI
  // ════════════════════════════════════════════════════════════
  return (
    <div className="w-screen h-screen bg-slate-100 flex flex-col overflow-hidden select-none">
      {/* 1. Header Bar */}
      <SessionHeader
        title={bookingDetail?.title || 'Phòng học trực tuyến 1-1'}
        roomType="ONE_ON_ONE"
        isRecording={true}
        userAvatar={avatarUrl}
        userName={displayName}
      />

      {/* 2. Main Stage (2 Columns: Spotlight Video + Sidebar) */}
      <main className="flex-1 p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        {/* Left Column: Spotlight Video View (Takes all remaining width) */}
        <div className="flex-1 h-full min-h-0">
          <OneOnOneSpotlightVideo
            localParticipant={localParticipant}
            remoteParticipant={remoteParticipant}
            remoteName={partnerName}
            remoteAvatar={partnerAvatar}
            localName={displayName}
            localAvatar={avatarUrl}
            screenShareTrack={screenShareTrack}
            isMicEnabled={isMicEnabled}
            isCameraEnabled={isCameraEnabled}
            isScreenSharing={isScreenSharing}
            onToggleMic={toggleMicrophone}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLeave={handleLeaveRoom}
          />
        </div>

        {/* Right Column: Session Sidebar Cards (100% Real-time & Vietnamese) */}
        <OneOnOneSessionSidebar
          remainingTimeFormatted={remainingTimeFormatted}
          elapsedMinutes={elapsedMinutes}
          totalDurationMinutes={totalDurationMinutes}
          totalCredits={
            bookingDetail?.totalCreditEscrowed ||
            tokenData?.escrowedCredit ||
            0
          }
          bookingId={bookingId}
          currentUserId={authUser?.id}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </main>

      {/* 3. Audio Track Renderers for Remote Participants */}
      {remoteParticipants.map((p) => (
        <AudioTrackRenderer key={p.identity} participant={p} />
      ))}

      {/* 4. Device Settings Modal (Standard Shared UI) */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 5. Leave Room Confirmation Modal (Standard Shared UI) */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 rounded-full bg-rose-50 text-rose-600">
              <LogOut className="w-5 h-5" />
            </div>
            <span>Xác nhận rời phòng học</span>
          </div>
        }
        description="Bạn có chắc chắn muốn rời khỏi phòng học này không? Bạn có thể tham gia lại bất kỳ lúc nào nếu buổi học vẫn còn trong khung giờ."
        size="md"
      >
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLeaveModalOpen(false)}
          >
            Ở lại
          </Button>
          <Button
            type="button"
            onClick={handleConfirmLeave}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20"
          >
            Rời phòng học
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default OneOnOneRoomPage;
