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
      className={`relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-300 flex items-center justify-center ${
        isSpeaking ? 'border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/20' : 'border-slate-800'
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
        /* Avatar Placeholder when Camera is OFF */
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-2xl md:text-3xl flex items-center justify-center shadow-xl border-4 border-slate-800">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 text-slate-300 font-medium text-sm md:text-base flex items-center gap-1.5">
            {displayName} {isLocal && <span className="text-xs text-indigo-400 font-normal">(Tôi)</span>}
          </p>
          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <VideoOff className="w-3.5 h-3.5" /> Camera đang tắt
          </span>
        </div>
      )}

      {/* Participant Name Badge & Indicators (Bottom Left) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 shadow-md">
        {isHost && (
          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
            <Crown className="w-3 h-3 text-amber-400" /> Mentor
          </span>
        )}
        <span className="text-xs font-medium text-slate-200 truncate max-w-[120px] md:max-w-[160px]">
          {displayName} {isLocal && '(Tôi)'}
        </span>
        <div
          className={`p-1 rounded-full ${
            isMicEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}
          title={isMicEnabled ? 'Micro đang bật' : 'Micro đang tắt'}
        >
          {isMicEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        </div>
      </div>

      {/* Host Moderation Quick Actions (Top Right) */}
      {canModerate && !isLocal && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          {onMute && (
            <button
              onClick={onMute}
              className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              title="Tắt mic người học"
            >
              <MicOff className="w-3.5 h-3.5" />
            </button>
          )}
          {onKick && (
            <button
              onClick={onKick}
              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-950/50 transition-colors text-xs flex items-center gap-1"
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
