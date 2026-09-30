import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  SlidersHorizontal,
  ShieldCheck,
  Clock,
  Coins,
  Users,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
} from 'lucide-react';
import { useMediaDevicePreview } from '../../hooks';
import { DeviceSettingsModal } from '../layout/DeviceSettingsModal';
import { PermissionPromptModal } from './PermissionPromptModal';
import { SKILL_CATEGORY_LABELS } from '@/features/post/constants';
import LogoImage from '@/assets/images/Logo.png';
import { Button } from '@/shared/components/ui';

export interface PreJoinLobbyProps {
  title: string;
  roomType: 'ONE_ON_ONE' | 'GROUP';
  currentUser: {
    name: string;
    avatar?: string;
    role?: 'MENTOR' | 'LEARNER' | string;
  };
  partnerInfo?: {
    name: string;
    avatar?: string;
    role?: 'MENTOR' | 'LEARNER' | string;
    trustScore?: number;
    headline?: string;
  };
  sessionMeta?: {
    scheduledTime?: string;
    durationMinutes?: number;
    totalCredits?: number;
    category?: string;
    skills?: string[];
    activeParticipants?: number;
    isFreeTier?: boolean;
  };
  isLoading?: boolean;
  isJoining?: boolean;
  onJoin: (settings: {
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    audioDeviceId?: string;
    videoDeviceId?: string;
  }) => void;
  onBack: () => void;
}

export const PreJoinLobby: React.FC<PreJoinLobbyProps> = ({
  title,
  roomType,
  currentUser,
  partnerInfo,
  sessionMeta,
  isLoading = false,
  isJoining = false,
  onJoin,
  onBack,
}) => {
  const {
    videoRef,
    stream,
    isCameraEnabled,
    isMicEnabled,
    audioLevel,
    audioInputs,
    videoInputs,
    audioOutputs,
    selectedAudioId,
    selectedVideoId,
    selectedOutputId,
    hasPermission,
    permissionError,
    isTestingSpeaker,
    isPermissionPromptOpen,
    requestPermissions,
    dismissPermissionPrompt,
    toggleCamera,
    toggleMicrophone,
    changeAudioInput,
    changeVideoInput,
    changeAudioOutput,
    testSpeaker,
    cleanup,
  } = useMediaDevicePreview();

  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Keyboard shortcuts: Ctrl+D for Mic, Ctrl+E for Cam
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is focusing an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleMicrophone();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggleCamera();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCamera, toggleMicrophone]);

  // Đảm bảo dừng mic & camera ngay lập tức khi người dùng điều hướng ra trang khác (Navbar, browser back, etc.)
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleJoinClick = () => {
    // Clean preview stream so hardware is freed for LiveKit
    cleanup();
    onJoin({
      isMicEnabled,
      isCameraEnabled,
      audioDeviceId: selectedAudioId || undefined,
      videoDeviceId: selectedVideoId || undefined,
    });
  };

  const handleBackClick = () => {
    cleanup();
    onBack();
  };

  const isOneOnOne = roomType === 'ONE_ON_ONE';
  const roleLabel = currentUser.role === 'MENTOR' ? 'Người hướng dẫn' : 'Học viên';

  const rawCat = (sessionMeta?.category || '').toUpperCase();
  const categoryLabel = SKILL_CATEGORY_LABELS[rawCat] || sessionMeta?.category;

  // Format title if it's an internal code like "utb-group-..."
  const isInternalRoomCode = title?.startsWith('utb-group-') || title?.startsWith('utb-1on1-');
  const displayTitle = isInternalRoomCode
    ? isOneOnOne
      ? 'Buổi học trực tuyến 1-1'
      : 'Phòng học nhóm UniTime'
    : title || (isOneOnOne ? 'Buổi học trực tuyến 1-1' : 'Phòng học nhóm UniTime');

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-slate-50 flex flex-col overflow-y-auto select-none font-sans text-slate-800">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 py-3.5 flex items-center justify-between border-b border-slate-200/80 backdrop-blur-md bg-white/85 shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            src={LogoImage}
            alt="UniTime Bank Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900 whitespace-nowrap">
                UniTime<span className="text-primary-600">Bank</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                PHÒNG CHỜ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Kiểm tra thiết bị âm thanh & camera trước khi vào phòng
            </p>
          </div>
        </div>

        {/* Network indicator & quick back */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Tín hiệu ổn định</span>
          </div>

          <button
            type="button"
            onClick={handleBackClick}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
        {/* LEFT COLUMN: Video Preview & Hardware Controls */}
        <div className="w-full lg:flex-1 max-w-2xl flex flex-col gap-4">
          {/* 16:9 Video Canvas Frame */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100/90 border border-slate-200/90 shadow-xl shadow-slate-200/50 flex items-center justify-center group">
            {/* Permission warning banner if permission denied */}
            {hasPermission === false && (
              <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Cần cấp quyền thiết bị</h3>
                <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed font-medium">
                  {permissionError ||
                    'Trình duyệt chưa được cấp quyền truy cập Camera và Microphone. Bạn vẫn có thể vào phòng nhưng người khác sẽ không nhìn thấy hoặc nghe thấy bạn.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            )}

            {/* Video feed element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 z-0 ${
                isCameraEnabled && hasPermission !== false ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Camera OFF Placeholder (Light Modern Style) */}
            {(!isCameraEnabled || hasPermission === false) && (
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-300">
                {/* Soft ambient glow behind avatar */}
                <div className="absolute w-36 h-36 rounded-full bg-primary-100/60 blur-2xl pointer-events-none" />

                <div className="relative mb-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-xl shadow-slate-300/60"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-primary-600 to-emerald-500 ring-4 ring-white flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-primary-500/20">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Pulsing ring */}
                  <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/50 animate-pulse pointer-events-none" />
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  {currentUser.name}
                </h4>
              </div>
            )}

            {/* Top-Right: Audio Sensitivity VU Meter (Only shown when mic is active, no redundant text) */}
            {isMicEnabled && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <div className="flex items-center gap-1 h-3 px-0.5">
                  <span
                    className="w-1 bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (audioLevel * 12) / 100)}px` }}
                  />
                  <span
                    className="w-1 bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (audioLevel * 16) / 100)}px` }}
                  />
                  <span
                    className="w-1 bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (audioLevel * 12) / 100)}px` }}
                  />
                  <span
                    className="w-1 bg-emerald-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(2, (audioLevel * 8) / 100)}px` }}
                  />
                </div>
              </div>
            )}

            {/* Floating Glass Control Dock (Bottom Center of Video Preview) */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-3.5 py-2 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 transition-all">
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isMicEnabled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs'
                    : 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-400 shadow-md shadow-rose-500/25'
                }`}
                title={isMicEnabled ? 'Tắt Microphone (Ctrl+D)' : 'Bật Microphone (Ctrl+D)'}
              >
                {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isCameraEnabled
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs'
                    : 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-400 shadow-md shadow-rose-500/25'
                }`}
                title={isCameraEnabled ? 'Tắt Camera (Ctrl+E)' : 'Bật Camera (Ctrl+E)'}
              >
                {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Quick Shortcuts & Settings Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Phím tắt nhanh:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
                Ctrl + D
              </span>
              <span>Micro</span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
                Ctrl + E
              </span>
              <span>Camera</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeviceSettings(true)}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span>Cài đặt</span>
              </button>

              <button
                type="button"
                onClick={testSpeaker}
                disabled={isTestingSpeaker}
                className="flex items-center gap-1.5 text-xs text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl border border-primary-200 font-bold cursor-pointer transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isTestingSpeaker ? 'Đang thử loa...' : 'Thử loa'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Session Details & Join Card */}
        <div className="w-full lg:w-[380px] xl:w-[400px] flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-5 sm:p-6 flex flex-col justify-between text-slate-800 space-y-4">
            {/* Header: Badges & Title */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5 flex-nowrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                    isOneOnOne
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-primary-50 text-primary-700 border border-primary-200'
                  }`}
                >
                  {isOneOnOne ? (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>Phòng 1:1</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3" />
                      <span>Phòng nhóm</span>
                    </>
                  )}
                </span>

                {!isOneOnOne && sessionMeta?.activeParticipants !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {sessionMeta.activeParticipants > 0
                        ? `${sessionMeta.activeParticipants} người`
                        : 'Chờ Host'}
                    </span>
                  </span>
                )}

                {!isOneOnOne && sessionMeta?.isFreeTier !== false && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                    5p miễn phí
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                {displayTitle}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                {categoryLabel && (
                  <p>
                    Chủ đề: <span className="text-slate-800 font-semibold">{categoryLabel}</span>
                  </p>
                )}
                {isInternalRoomCode && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Mã: {title}
                  </span>
                )}
              </div>
            </div>

            {/* Partner / Host Information (Compact) */}
            {partnerInfo && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                {partnerInfo.avatar ? (
                  <img
                    src={partnerInfo.avatar}
                    alt={partnerInfo.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-200">
                    {(partnerInfo.name || 'N').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {partnerInfo.name ? partnerInfo.name.replace(/\bMentor\b/gi, 'Người hướng dẫn') : 'Người hướng dẫn'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 text-[10px] font-semibold shrink-0">
                      {partnerInfo.role === 'MENTOR' ? 'Người hướng dẫn' : 'Học viên'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {partnerInfo.headline
                      ? partnerInfo.headline.replace(/\bMentor\b/gi, 'Người hướng dẫn')
                      : 'Người hướng dẫn UniTime Bank'}
                  </p>
                </div>
                {partnerInfo.trustScore !== undefined && partnerInfo.trustScore > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{partnerInfo.trustScore}</span>
                  </div>
                )}
              </div>
            )}

            {/* Session Metadata Grid (Duration / Credits if present) */}
            {(sessionMeta?.durationMinutes || sessionMeta?.totalCredits !== undefined) && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {sessionMeta?.durationMinutes && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Thời lượng</span>
                      <span className="font-bold text-slate-800">{sessionMeta.durationMinutes} phút</span>
                    </div>
                  </div>
                )}

                {sessionMeta?.totalCredits !== undefined && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-slate-400 text-[10px] block">Chi phí</span>
                      <span className="font-bold text-slate-800">
                        {sessionMeta.totalCredits > 0
                          ? `${sessionMeta.totalCredits} Credit`
                          : '1 Credit / phút'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current User Identity (Compact Single Row) */}
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100/90 flex items-center gap-2.5">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {currentUser.name}
                </span>
              </div>
              <span className="text-[10px] text-primary-700 font-bold bg-primary-50 border border-primary-200/60 px-2 py-0.5 rounded-full shrink-0">
                {roleLabel}
              </span>
            </div>

            {/* Actions: Join Call */}
            <div className="space-y-2 pt-1">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleJoinClick}
                disabled={isJoining || isLoading}
                isLoading={isJoining}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Vào phòng học ngay
              </Button>

              <button
                type="button"
                onClick={handleBackClick}
                disabled={isJoining}
                className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
              >
                Quay lại
              </button>
            </div>

            {/* Security footnote */}
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Kết nối mã hóa WebRTC an toàn</span>
            </div>
          </div>
        </div>
      </main>

      {/* Google Meet Style Device Settings Modal */}
      <DeviceSettingsModal
        isOpen={showDeviceSettings}
        onClose={() => setShowDeviceSettings(false)}
        currentAudioDeviceId={selectedAudioId}
        currentVideoDeviceId={selectedVideoId}
        onSelectAudioDevice={changeAudioInput}
        onSelectVideoDevice={changeVideoInput}
        previewStream={stream}
        audioLevel={audioLevel}
      />

      {/* Google Meet Style Permission Prompt Modal */}
      <PermissionPromptModal
        isOpen={isPermissionPromptOpen}
        onAllow={requestPermissions}
        onDismiss={dismissPermissionPrompt}
      />
    </div>
  );
};

export default PreJoinLobby;
