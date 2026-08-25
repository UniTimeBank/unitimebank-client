import React, { useEffect, useRef } from 'react';
import { Participant, Track, LocalParticipant, RemoteParticipant } from 'livekit-client';
import { Mic, MicOff, VideoOff, Crown } from 'lucide-react';

interface ParticipantTileProps {
  participant: Participant | LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isHost?: boolean;
  onMute?: () => void;
  onKick?: () => void;
  canModerate?: boolean;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  isLocal = false,
  isSpeaking = false,
  isHost = false,
  onMute,
  onKick,
  canModerate = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Check audio/video tracks
  const isCameraEnabled = participant.isCameraEnabled;
  const isMicEnabled = participant.isMicrophoneEnabled;
  const displayName = participant.name || participant.identity || (isLocal ? 'Tôi' : 'Người học');

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoPub = participant.getTrackPublication(Track.Source.Camera);
    const videoTrack = videoPub?.track;

    if (videoTrack && isCameraEnabled) {
      videoTrack.attach(videoElement);
    }

    return () => {
      if (videoTrack) {
        videoTrack.detach(videoElement);
      }
    };
  }, [participant, isCameraEnabled]);

  return (
    <div
      className={`relative w-full h-full rounded-3xl overflow-hidden shadow-sm border-2 transition-all duration-300 flex items-center justify-center ${
        isSpeaking
          ? 'border-primary-500 shadow-primary-500/20 ring-4 ring-primary-500/20'
          : isCameraEnabled
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200/90'
      }`}
    >
      {/* Video Element */}
      {isCameraEnabled ? (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        /* Avatar Placeholder when Camera is OFF - Nền Trắng Sáng Sạch Sẽ */
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-50 text-primary-700 font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-xs border-4 border-primary-100/90">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="mt-3.5 text-slate-800 font-bold text-sm md:text-base flex items-center gap-1.5">
            <span>{displayName}</span>
            {isLocal && (
              <span className="text-[11px] text-primary-700 font-bold bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                Tôi
              </span>
            )}
          </p>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
            <VideoOff className="w-3.5 h-3.5" /> Camera đang tắt
          </span>
        </div>
      )}

      {/* Participant Name Badge & Indicators (Bottom Left) */}
      <div
        className={`absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs backdrop-blur-md ${
          isCameraEnabled
            ? 'bg-slate-950/75 border-slate-700/60 text-slate-200'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
      >
        {isHost && (
          <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary-200">
            <Crown className="w-3 h-3 text-primary-600" /> Mentor
          </span>
        )}
        <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[160px]">
          {displayName} {isLocal && '(Tôi)'}
        </span>
        <div
          className={`p-1 rounded-full border ${
            isMicEnabled
              ? 'bg-primary-50 text-primary-700 border-primary-200'
              : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}
          title={isMicEnabled ? 'Micro đang bật' : 'Micro đang tắt'}
        >
          {isMicEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        </div>
      </div>

      {/* Host Moderation Quick Actions (Top Right) */}
      {canModerate && !isLocal && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
          {onMute && (
            <button
              onClick={onMute}
              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Tắt mic người học"
            >
              <MicOff className="w-3.5 h-3.5" />
            </button>
          )}
          {onKick && (
            <button
              onClick={onKick}
              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Mời ra khỏi phòng"
            >
              Mời ra
            </button>
          )}
        </div>
      )}
    </div>
  );
};
