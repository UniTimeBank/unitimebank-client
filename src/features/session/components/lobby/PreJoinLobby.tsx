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
  Radio,
  Loader2,
  Star,
} from 'lucide-react';
import { useMediaDevicePreview } from '../../hooks';
import { DeviceSettingsModal } from '../layout/DeviceSettingsModal';
import { PermissionPromptModal } from './PermissionPromptModal';

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
  const roleLabel = currentUser.role === 'MENTOR' ? 'Mentor (Người dạy)' : 'Học viên';

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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-primary-600/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-slate-900">
                UniTime Bank
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
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-xl shadow-slate-200/50 flex items-center justify-center group">
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
              className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                isCameraEnabled && hasPermission !== false ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            />

            {/* Camera OFF Placeholder (Google Meet Style) */}
            {(!isCameraEnabled || hasPermission === false) && (
              <div className="flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-300">
                <div className="relative mb-3">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-primary-700 to-emerald-600 border-4 border-slate-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Pulsing ring */}
                  <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-500/30 animate-pulse pointer-events-none" />
                </div>

                <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-medium">
                  <VideoOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Máy ảnh đang tắt</span>
                </p>
              </div>
            )}

            {/* Top-Left: Status Overlay Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCameraEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>{isCameraEnabled ? 'Camera trực tiếp' : 'Camera đã tắt'}</span>
              </span>
            </div>

            {/* Top-Right: Live Audio Sensitivity VU Meter */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-full backdrop-blur-md border transition-all flex items-center gap-2 shadow-sm ${
                  isMicEnabled
                    ? 'bg-slate-950/60 border-white/10 text-white'
                    : 'bg-rose-950/70 border-rose-600/50 text-rose-200'
                }`}
              >
                {isMicEnabled ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    {/* Animated 4 Equalizer Bars */}
                    <div className="flex items-center gap-1 h-3.5 px-0.5">
                      <span
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(3, (audioLevel * 14) / 100)}px` }}
                      />
                      <span
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(4, (audioLevel * 18) / 100)}px` }}
                      />
                      <span
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(3, (audioLevel * 14) / 100)}px` }}
                      />
                      <span
                        className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                        style={{ height: `${Math.max(2, (audioLevel * 10) / 100)}px` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300 hidden sm:inline">
                      {audioLevel > 5 ? 'Đang nhận giọng' : 'Micro sẵn sàng'}
                    </span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px] font-semibold text-rose-300">Đã tắt micro</span>
                  </>
                )}
              </div>
            </div>

            {/* Floating Glass Control Dock (Bottom Center of Video Preview) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/75 backdrop-blur-xl border border-white/15 shadow-2xl">
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isMicEnabled
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600'
                    : 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-rose-600/30 animate-pulse'
                }`}
                title={isMicEnabled ? 'Tắt Microphone (Ctrl+D)' : 'Bật Microphone (Ctrl+D)'}
              >
                {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isCameraEnabled
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600'
                    : 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-rose-600/30'
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
        <div className="w-full lg:w-[420px] flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 flex flex-col justify-between text-slate-800 space-y-5">
            {/* Top Tag & Session Title */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isOneOnOne
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-primary-50 text-primary-700 border border-primary-200'
                  }`}
                >
                  {isOneOnOne ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Phòng học 1:1</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      <span>Phòng học nhóm</span>
                    </>
                  )}
                </span>

                {!isOneOnOne && sessionMeta?.isFreeTier !== false && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                    5 phút đầu miễn phí
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug line-clamp-2">
                {displayTitle}
              </h2>

              {isInternalRoomCode && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Mã phòng: {title}
                </p>
              )}

              {sessionMeta?.category && (
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Chủ đề: <span className="text-slate-800 font-semibold">{sessionMeta.category}</span>
                </p>
              )}
            </div>

            {/* Partner / Host Information */}
            {partnerInfo && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                {partnerInfo.avatar ? (
                  <img
                    src={partnerInfo.avatar}
                    alt={partnerInfo.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-base border border-primary-200">
                    {partnerInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {partnerInfo.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-semibold shrink-0">
                      {partnerInfo.role === 'MENTOR' ? 'Mentor' : 'Học viên'}
                    </span>
                  </div>
                  {partnerInfo.headline ? (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{partnerInfo.headline}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-0.5">Thành viên UniTime Bank</p>
                  )}
                  {partnerInfo.trustScore !== undefined && partnerInfo.trustScore > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{partnerInfo.trustScore} điểm uy tín</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {sessionMeta?.durationMinutes && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block">Thời lượng</span>
                    <span className="font-bold text-slate-800">{sessionMeta.durationMinutes} phút</span>
                  </div>
                </div>
              )}

              {sessionMeta?.totalCredits !== undefined && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500 shrink-0" />
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

              {!isOneOnOne && sessionMeta?.activeParticipants !== undefined && (
                <div className="col-span-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 text-emerald-800">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-xs">
                    Hiện có <span className="font-bold">{sessionMeta.activeParticipants} người</span> đang
                    trong phòng học
                  </span>
                </div>
              )}
            </div>

            {/* Current User Identity Badge */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Đang chuẩn bị tham gia với tư cách:
              </span>
              <div className="flex items-center gap-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</h4>
                  <span className="text-[11px] text-primary-600 font-semibold">{roleLabel}</span>
                </div>
              </div>
            </div>

            {/* Pre-flight Device Status Checklist */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-slate-400" />
                  <span>Microphone:</span>
                </span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isMicEnabled ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {isMicEnabled ? 'Sẵn sàng' : 'Tắt tiếng'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  <span>Camera:</span>
                </span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    isCameraEnabled ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {isCameraEnabled ? 'Sẵn sàng' : 'Tắt hình'}
                </span>
              </div>
            </div>

            {/* Actions: Join Call & Back */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleJoinClick}
                disabled={isJoining || isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-primary-600 via-emerald-600 to-teal-600 hover:from-primary-700 hover:via-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-primary-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang kết nối vào phòng...</span>
                  </>
                ) : (
                  <>
                    <span>Vào phòng học ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBackClick}
                disabled={isJoining}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
            </div>

            {/* Security footnote */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Kết nối mã hóa WebRTC an toàn bởi UniTime Bank</span>
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
