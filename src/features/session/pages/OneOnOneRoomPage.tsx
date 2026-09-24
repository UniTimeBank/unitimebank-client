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
import { useLiveKitRoom, useSessionSocket, useInRoomChat, useSessionRecorder } from '../hooks';
import type { InRoomChatMessage } from '../types';
import type { DirectUploadAsset } from '@/core/api/upload';
import {
  SessionHeader,
  OneOnOneSpotlightVideo,
  OneOnOneSessionSidebar,
  DeviceSettingsModal,
  AudioTrackRenderer,
  SessionRecordingsModal,
  SessionEndedModal,
  PreJoinLobby,
} from '../components';
import { ReportViolationModal } from '@/features/moderation';
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

  // Pre-join Lobby State
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [preJoinSettings, setPreJoinSettings] = useState<{
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    audioDeviceId?: string;
    videoDeviceId?: string;
  }>({
    isMicEnabled: true,
    isCameraEnabled: true,
  });

  // Modals & UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false);
  const [reportInitialFiles, setReportInitialFiles] = useState<File[] | undefined>(undefined);

  // In-App Screen Recording (Tổng hạn mức tích lũy tối đa 100MB)
  const {
    isRecording,
    isPaused: isRecordingPaused,
    currentDuration: recordingDurationSeconds,
    currentClipBytes,
    clips: recordingClips,
    totalBytes: recordingTotalBytes,
    remainingBytes: recordingRemainingBytes,
    usedPercentage: recordingUsedPercentage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    deleteClip,
    downloadClip,
  } = useSessionRecorder(bookingId);

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
    switchAudioDevice,
    switchVideoDevice,
    disconnect,
  } = useLiveKitRoom({
    wsUrl: tokenData?.livekitWsUrl,
    token: tokenData?.livekitToken,
    autoConnect: hasJoinedRoom && !!tokenData?.livekitToken,
    initialMicEnabled: preJoinSettings.isMicEnabled,
    initialCameraEnabled: preJoinSettings.isCameraEnabled,
    preferredAudioDeviceId: preJoinSettings.audioDeviceId,
    preferredVideoDeviceId: preJoinSettings.videoDeviceId,
    onDataReceived: handleNewMessage,
    onDisconnected: () => {
      toast.info('Bạn đã rời khỏi phòng học.');
      navigate('/manage/bookings');
    },
  });

  const { sendMessage } = useSessionSocket({
    roomId: hasJoinedRoom ? tokenData?.roomId : undefined,
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
  const [isEndedModalOpen, setIsEndedModalOpen] = useState(false);

  useEffect(() => {
    if (bookingDetail?.scheduledEnd && !hasAutoEnded && !isJoining) {
      const endTime = new Date(bookingDetail.scheduledEnd).getTime();
      if (Date.now() >= endTime) {
        setHasAutoEnded(true);
        if (bookingId) {
          completeBookingMutation(bookingId)
            .unwrap()
            .catch((err) => {
              console.warn('Auto-complete booking call error:', err);
            });
        }
        disconnect();
        setIsEndedModalOpen(true);
      }
    }
  }, [now, bookingDetail, hasAutoEnded, isJoining, disconnect, bookingId, completeBookingMutation]);

  // 7. Safe Leave Room handler with Shared Modal
  const handleLeaveRoom = () => {
    setIsLeaveModalOpen(true);
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    disconnect();
    navigate('/manage/bookings');
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
  // PRE-JOIN WAITING LOBBY (Google Meet / Zoom style)
  // ════════════════════════════════════════════════════════════
  if (!hasJoinedRoom) {
    return (
      <PreJoinLobby
        title={bookingDetail?.title || 'Phòng học trực tuyến 1-1'}
        roomType="ONE_ON_ONE"
        currentUser={{
          name: displayName,
          avatar: avatarUrl,
          role: isMentor ? 'MENTOR' : 'LEARNER',
        }}
        partnerInfo={{
          name: partnerName,
          avatar: partnerAvatar,
          role: isMentor ? 'LEARNER' : 'MENTOR',
          trustScore: isMentor ? (bookingDetail as any)?.learnerTrustScore : (bookingDetail as any)?.mentorTrustScore,
        }}
        sessionMeta={{
          scheduledTime: bookingDetail?.scheduledStart,
          durationMinutes: totalDurationMinutes,
          totalCredits: bookingDetail?.totalCreditEscrowed || tokenData?.escrowedCredit || 0,
        }}
        isLoading={isJoining || isBookingLoading}
        isJoining={false}
        onJoin={(settings) => {
          setPreJoinSettings(settings);
          setHasJoinedRoom(true);
        }}
        onBack={() => {
          navigate('/manage/bookings');
        }}
      />
    );
  }

  // ════════════════════════════════════════════════════════════
  // MAIN FULL-SCREEN UI
  // ════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 w-full h-full bg-slate-100 flex flex-col overflow-hidden select-none z-40">
      {/* 1. Header Bar */}
      <SessionHeader
        title={bookingDetail?.title || 'Phòng học trực tuyến 1-1'}
        roomType="ONE_ON_ONE"
        isRecording={isRecording}
        isPaused={isRecordingPaused}
        recordingDurationSeconds={recordingDurationSeconds}
        recordingCurrentMB={(currentClipBytes / (1024 * 1024)).toFixed(1)}
        recordingTotalMB={(recordingTotalBytes / (1024 * 1024)).toFixed(1)}
        recordingClipsCount={recordingClips.length}
        onOpenRecordings={() => setIsRecordingsModalOpen(true)}
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
            isRecording={isRecording}
            isPaused={isRecordingPaused}
            recordingClipsCount={recordingClips.length}
            onToggleMic={toggleMicrophone}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onToggleRecording={() => {
              if (isRecording) {
                stopRecording().then(() => setIsRecordingsModalOpen(true));
              } else {
                startRecording();
              }
            }}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onStopRecording={() => stopRecording().then(() => setIsRecordingsModalOpen(true))}
            onOpenRecordings={() => setIsRecordingsModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onReport={() => setIsReportOpen(true)}
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
        currentAudioDeviceId={preJoinSettings.audioDeviceId}
        currentVideoDeviceId={preJoinSettings.videoDeviceId}
        onSelectAudioDevice={switchAudioDevice}
        onSelectVideoDevice={switchVideoDevice}
      />

      {/* 5. Violation Report Modal */}
      <ReportViolationModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportInitialFiles(undefined);
        }}
        targetUserId={
          (isMentor ? bookingDetail?.learnerId : bookingDetail?.mentorId) || ''
        }
        targetUserName={partnerName}
        targetRole={isMentor ? 'LEARNER' : 'MENTOR'}
        targetType="SESSION"
        targetId={bookingId}
        initialFiles={reportInitialFiles}
        onSuccess={() => {
          toast.success('Báo cáo vi phạm đã được gửi đến ban kiểm duyệt.');
          setIsReportOpen(false);
          setReportInitialFiles(undefined);
        }}
      />

      {/* 6. Leave Room Confirmation Modal (Standard Shared UI) */}
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

      {/* 7. Session Screen Recordings Modal (100MB Total Quota) */}
      <SessionRecordingsModal
        isOpen={isRecordingsModalOpen}
        onClose={() => setIsRecordingsModalOpen(false)}
        clips={recordingClips}
        totalBytes={recordingTotalBytes}
        remainingBytes={recordingRemainingBytes}
        usedPercentage={recordingUsedPercentage}
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onDeleteClip={deleteClip}
        onDownloadClip={downloadClip}
        onReportWithClip={(clip) => {
          setReportInitialFiles([clip.file]);
          setIsReportOpen(true);
        }}
      />
      {/* 8. Session Ended Modal (Rating & Result summary) */}
      <SessionEndedModal
        isOpen={isEndedModalOpen}
        creditsTransferred={bookingDetail?.totalCreditEscrowed || 0}
        durationFormatted={`${bookingDetail?.durationMinutes || 60} phút`}
        isHost={isMentor}
        bookingId={bookingId}
        sessionType="ONE_ON_ONE"
        mentorId={bookingDetail?.mentorId}
        mentorName={bookingDetail?.mentorName || partnerName}
        mentorAvatar={bookingDetail?.mentorAvatar || partnerAvatar}
        redirectUrl="/explore"
      />
    </div>
  );
};
export default OneOnOneRoomPage;
