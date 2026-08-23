import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PenTool,
  Code,
  MessageSquare,
  Settings,
  PhoneOff,
} from 'lucide-react';

interface SessionControlsBarProps {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  isWhiteboardOpen: boolean;
  isEditorOpen: boolean;
  unreadCount?: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleWhiteboard: () => void;
  onToggleEditor: () => void;
  onOpenSettings?: () => void;
  onLeave: () => void;
}

export const SessionControlsBar: React.FC<SessionControlsBarProps> = ({
  isMicEnabled,
  isCameraEnabled,
  isScreenSharing,
  isChatOpen,
  isWhiteboardOpen,
  isEditorOpen,
  unreadCount = 0,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleChat,
  onToggleWhiteboard,
  onToggleEditor,
  onOpenSettings,
  onLeave,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3 bg-slate-950/85 backdrop-blur-xl px-4 md:px-6 py-2.5 rounded-2xl border border-slate-800/80 shadow-2xl">
      {/* Microphone */}
      <button
        onClick={onToggleMic}
        className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
          isMicEnabled
            ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30'
        }`}
        title={isMicEnabled ? 'Tắt Micro (Mute)' : 'Bật Micro (Unmute)'}
      >
        {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Camera */}
      <button
        onClick={onToggleCamera}
        className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
          isCameraEnabled
            ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30'
        }`}
        title={isCameraEnabled ? 'Tắt Camera' : 'Bật Camera'}
      >
        {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* Screen Share */}
      <button
        onClick={onToggleScreenShare}
        className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
          isScreenSharing
            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
        }`}
        title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
      >
        <Monitor className="w-5 h-5" />
      </button>

      <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

      {/* Whiteboard */}
      <button
        onClick={onToggleWhiteboard}
        className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
          isWhiteboardOpen
            ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-600/30'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
        }`}
        title="Bảng vẽ trực tuyến (Whiteboard)"
      >
        <PenTool className="w-5 h-5" />
      </button>

      {/* Code Editor */}
      <button
        onClick={onToggleEditor}
        className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
          isEditorOpen
            ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-sky-600/30'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
        }`}
        title="Trình soạn code trực tiếp (Code Editor)"
      >
        <Code className="w-5 h-5" />
      </button>

      {/* Chat Toggle with Unread Badge */}
      <button
        onClick={onToggleChat}
        className={`relative p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
          isChatOpen
            ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/30'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
        }`}
        title="Trò chuyện trong phòng"
      >
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && !isChatOpen && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Device Settings */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-all shadow-md flex items-center justify-center"
          title="Cài đặt thiết bị"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Leave Call (Red button) */}
      <button
        onClick={onLeave}
        className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-all shadow-lg shadow-rose-600/40 flex items-center gap-1.5 px-4 ml-1"
        title="Rời khỏi phòng học"
      >
        <PhoneOff className="w-5 h-5" />
        <span className="text-xs hidden md:inline">Kết thúc</span>
      </button>
    </div>
  );
};
