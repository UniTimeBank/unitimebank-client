import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PenTool,
  MessageSquare,
  Settings,
  ShieldAlert,
  LogOut,
  Power,
  Users,
  CircleDot,
  Pause,
  Play,
  Square,
} from 'lucide-react';

interface SessionControlsBarProps {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  isWhiteboardOpen: boolean;
  isEditorOpen?: boolean;
  unreadCount?: number;
  isHost?: boolean;
  participantCount?: number;
  isRecording?: boolean;
  isPaused?: boolean;
  recordingClipsCount?: number;
  recordingTotalMB?: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleWhiteboard: () => void;
  onToggleEditor?: () => void;
  onOpenSettings?: () => void;
  onOpenParticipants?: () => void;
  onToggleRecording?: () => void;
  onPauseRecording?: () => void;
  onResumeRecording?: () => void;
  onStopRecording?: () => void;
  onOpenRecordings?: () => void;
  onReport?: () => void;
  onLeave: () => void;
  onCloseRoom?: () => void;
}

export const SessionControlsBar: React.FC<SessionControlsBarProps> = ({
  isMicEnabled,
  isCameraEnabled,
  isScreenSharing,
  isChatOpen,
  isWhiteboardOpen,
  isEditorOpen,
  unreadCount = 0,
  isHost = false,
  participantCount,
  isRecording = false,
  isPaused = false,
  recordingClipsCount = 0,
  recordingTotalMB,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleWhiteboard,
  onToggleEditor,
  onOpenSettings,
  onOpenParticipants,
  onToggleRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onOpenRecordings,
  onReport,
  onLeave,
  onCloseRoom,
}) => {
  return (
    <div className="fixed bottom-6 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-2.5 bg-white/95 backdrop-blur-xl px-4 md:px-5 py-2 rounded-2xl border border-slate-200/90 shadow-xl">
      {/* Microphone */}
      <button
        onClick={onToggleMic}
        className={`p-3 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
          isMicEnabled
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-rose-600/10'
        }`}
        title={isMicEnabled ? 'Tắt Micro (Mute)' : 'Bật Micro (Unmute)'}
      >
        {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Camera */}
      <button
        onClick={onToggleCamera}
        className={`p-3 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
          isCameraEnabled
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-rose-600/10'
        }`}
        title={isCameraEnabled ? 'Tắt Camera' : 'Bật Camera'}
      >
        {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* Screen Share */}
      <button
        onClick={onToggleScreenShare}
        className={`p-3 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
          isScreenSharing
            ? 'bg-primary-700 text-white shadow-primary-700/20'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
        }`}
        title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
      >
        <Monitor className="w-5 h-5" />
      </button>

      <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

      {/* Whiteboard */}
      <button
        onClick={onToggleWhiteboard}
        className={`p-3 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
          isWhiteboardOpen
            ? 'bg-primary-700 text-white shadow-primary-700/20'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
        }`}
        title="Bảng vẽ trực tuyến (Whiteboard)"
      >
        <PenTool className="w-5 h-5" />
      </button>

      {/* Chat Toggle with Unread Badge */}
      <button
        onClick={onToggleChat}
        className={`relative p-3 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
          isChatOpen
            ? 'bg-primary-700 text-white shadow-primary-700/20'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
        }`}
        title="Trò chuyện trong phòng"
      >
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && !isChatOpen && (
          <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Participants Button (Clean Zoom-style layout) */}
      {onOpenParticipants && (
        <button
          onClick={onOpenParticipants}
          className="h-11 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer font-semibold text-xs"
          title="Danh sách thành viên & Quản lý"
        >
          <Users className="w-4 h-4 text-slate-600 shrink-0" />
          {participantCount !== undefined && (
            <span className="bg-white text-slate-800 text-[11px] font-bold px-1.5 py-0.2 rounded-md border border-slate-200 shadow-2xs">
              {participantCount}
            </span>
          )}
        </button>
      )}

      {/* Screen Recording Controls (Zoom-style Pause/Resume & Stop) */}
      {isRecording ? (
        <div className="flex items-center gap-1 bg-rose-50 p-0.5 rounded-xl border border-rose-200 shadow-xs">
          {/* Pause / Resume Button */}
          {isPaused ? (
            <button
              onClick={onResumeRecording}
              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs flex items-center justify-center cursor-pointer animate-pulse"
              title="Tiếp tục ghi hình"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={onPauseRecording}
              className="p-2 rounded-lg bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-slate-200/60 transition-all shadow-xs flex items-center justify-center cursor-pointer"
              title="Tạm dừng ghi hình"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={onStopRecording || onToggleRecording}
            className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xs flex items-center justify-center cursor-pointer"
            title="Dừng ghi hình & Lưu clip"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      ) : (
        <button
          onClick={
            recordingClipsCount > 0 ? onOpenRecordings : onToggleRecording
          }
          className={`relative p-3 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
            recordingClipsCount > 0
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
          }`}
          title={
            recordingClipsCount > 0
              ? `Xem ${recordingClipsCount} video đã quay (${recordingTotalMB || '0'} MB / 100 MB)`
              : 'Ghi hình buổi học (Giống Zoom - Tối đa 100MB)'
          }
        >
          <CircleDot className="w-5 h-5 text-slate-700" />
          {recordingClipsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {recordingClipsCount}
            </span>
          )}
        </button>
      )}

      {/* Device Settings */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60 transition-all shadow-xs flex items-center justify-center cursor-pointer"
          title="Cài đặt thiết bị"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Report Button */}
      {onReport && (
        <button
          onClick={onReport}
          className="p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200/60 transition-all shadow-xs flex items-center justify-center cursor-pointer"
          title="Báo cáo vi phạm phòng học"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
      )}

      {/* Action Buttons: Host has both 'Rời phòng' and 'Đóng phòng', Learners have 'Rời phòng' */}
      {isHost && onCloseRoom ? (
        <div className="flex items-center gap-1.5 ml-1">
          {/* Host Leave Room (Temporary) */}
          <button
            onClick={onLeave}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60 font-semibold transition-all shadow-xs flex items-center gap-1.5 px-3.5 cursor-pointer"
            title="Tạm thời rời khỏi phòng (Phòng học vẫn tiếp tục)"
          >
            <LogOut className="w-5 h-5 text-slate-600" />
            <span className="text-xs hidden md:inline">Rời phòng</span>
          </button>

          {/* Host Close Room (Permanently close for everyone) */}
          <button
            onClick={onCloseRoom}
            className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 px-3.5 cursor-pointer"
            title="Đóng phòng học cho tất cả thành viên"
          >
            <Power className="w-5 h-5" />
            <span className="text-xs hidden md:inline">Đóng phòng</span>
          </button>
        </div>
      ) : (
        /* Learner Leave Call */
        <button
          onClick={onLeave}
          className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 px-4 ml-1 cursor-pointer"
          title="Rời khỏi phòng học"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs hidden md:inline">Rời phòng</span>
        </button>
      )}
    </div>
  );
};
