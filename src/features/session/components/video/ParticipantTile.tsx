import React, { useEffect, useRef, useState } from 'react';
import { Participant, Track, LocalParticipant, RemoteParticipant, ParticipantEvent } from 'livekit-client';
import { Mic, MicOff, Crown } from 'lucide-react';

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
  const [imgError, setImgError] = useState(false);

  // Dynamic state reactive to LiveKit events
  const [isCameraEnabled, setIsCameraEnabled] = useState(participant.isCameraEnabled);
  const [isMicEnabled, setIsMicEnabled] = useState(participant.isMicrophoneEnabled);
  const [videoTrack, setVideoTrack] = useState<Track | null>(() => {
    return participant.getTrackPublication(Track.Source.Camera)?.track || null;
  });
  
  // Trích xuất metadata (avatarUrl, displayName thực tế nếu có)
  let avatarUrl: string | undefined;
  let parsedName: string | undefined;
  try {
    if (participant.metadata) {
      const parsed = JSON.parse(participant.metadata);
      avatarUrl = parsed.avatarUrl || parsed.avatar;
      parsedName = parsed.displayName || parsed.name;
    }
  } catch {
    // ignore parse error
  }

  const rawName = participant.name || parsedName || participant.identity;
  const isGenericMentor = !rawName || rawName.trim().toLowerCase() === 'mentor';
  const displayName = isGenericMentor ? (isLocal ? 'Bạn' : (isHost ? 'Host' : 'Thành viên')) : rawName;
  const initialLetter = (displayName || 'U').trim().charAt(0).toUpperCase();

  useEffect(() => {
    setIsCameraEnabled(participant.isCameraEnabled);
    setIsMicEnabled(participant.isMicrophoneEnabled);
    setVideoTrack(participant.getTrackPublication(Track.Source.Camera)?.track || null);

    const handleTrackSubscribed = (track: Track, pub: any) => {
      if (pub.source === Track.Source.Camera || track.source === Track.Source.Camera) {
        setIsCameraEnabled(true);
        setVideoTrack(track);
      }
      if (pub.source === Track.Source.Microphone || track.source === Track.Source.Microphone) {
        setIsMicEnabled(true);
      }
    };

    const handleTrackUnsubscribed = (track: Track, pub: any) => {
      if (pub.source === Track.Source.Camera || track.source === Track.Source.Camera) {
        setIsCameraEnabled(false);
        setVideoTrack(null);
      }
    };

    const handleTrackMuted = (pub: any) => {
      if (pub.source === Track.Source.Camera) setIsCameraEnabled(false);
      if (pub.source === Track.Source.Microphone) setIsMicEnabled(false);
    };

    const handleTrackUnmuted = (pub: any) => {
      if (pub.source === Track.Source.Camera) {
        setIsCameraEnabled(true);
        if (pub.track) setVideoTrack(pub.track);
      }
      if (pub.source === Track.Source.Microphone) setIsMicEnabled(true);
    };

    const handleTrackPublished = (pub: any) => {
      if (pub.source === Track.Source.Camera) {
        setIsCameraEnabled(true);
        if (pub.track) setVideoTrack(pub.track);
      }
      if (pub.source === Track.Source.Microphone) setIsMicEnabled(true);
    };

    const handleTrackUnpublished = (pub: any) => {
      if (pub.source === Track.Source.Camera) {
        setIsCameraEnabled(false);
        setVideoTrack(null);
      }
      if (pub.source === Track.Source.Microphone) setIsMicEnabled(false);
    };

    participant.on(ParticipantEvent.TrackSubscribed, handleTrackSubscribed);
    participant.on(ParticipantEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    participant.on(ParticipantEvent.TrackMuted, handleTrackMuted);
    participant.on(ParticipantEvent.TrackUnmuted, handleTrackUnmuted);
    participant.on(ParticipantEvent.TrackPublished, handleTrackPublished);
    participant.on(ParticipantEvent.TrackUnpublished, handleTrackUnpublished);
    participant.on(ParticipantEvent.LocalTrackPublished, handleTrackPublished);
    participant.on(ParticipantEvent.LocalTrackUnpublished, handleTrackUnpublished);

    return () => {
      participant.off(ParticipantEvent.TrackSubscribed, handleTrackSubscribed);
      participant.off(ParticipantEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      participant.off(ParticipantEvent.TrackMuted, handleTrackMuted);
      participant.off(ParticipantEvent.TrackUnmuted, handleTrackUnmuted);
      participant.off(ParticipantEvent.TrackPublished, handleTrackPublished);
      participant.off(ParticipantEvent.TrackUnpublished, handleTrackUnpublished);
      participant.off(ParticipantEvent.LocalTrackPublished, handleTrackPublished);
      participant.off(ParticipantEvent.LocalTrackUnpublished, handleTrackUnpublished);
    };
  }, [participant]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const track = videoTrack || participant.getTrackPublication(Track.Source.Camera)?.track;

    if (track && isCameraEnabled) {
      track.attach(videoElement);
    }

    return () => {
      if (track) {
        track.detach(videoElement);
      }
    };
  }, [participant, isCameraEnabled, videoTrack]);

  return (
    <div
      className={`group relative w-full h-full rounded-3xl overflow-hidden shadow-xs border transition-all duration-300 flex items-center justify-center select-none ${
        isCameraEnabled ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
      } ${
        isSpeaking
          ? 'border-emerald-500 shadow-emerald-500/20 ring-4 ring-emerald-500/20'
          : ''
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
        /* Avatar Placeholder when Camera is OFF - Clean Light Theme */
        <div className="flex items-center justify-center p-6 text-center">
          <div className="relative flex items-center justify-center">
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt={displayName}
                onError={() => setImgError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md border-4 border-slate-100 ring-2 ring-slate-200/60"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-500 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-md border-4 border-slate-100 ring-2 ring-slate-200/60 tracking-wider">
                {initialLetter}
              </div>
            )}

            {/* Speaking Pulse Wave */}
            {isSpeaking && (
              <span className="absolute -inset-2.5 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
            )}
          </div>
        </div>
      )}

      {/* Google Meet Style Name Tag (Bottom Left) */}
      <div
        className={`absolute bottom-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-xs border z-10 select-none transition-all ${
          isCameraEnabled
            ? 'bg-slate-950/70 backdrop-blur-md text-white border-white/15'
            : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/90 shadow-sm'
        }`}
      >
        {isHost && (
          <span
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              isCameraEnabled
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Host</span>
          </span>
        )}
        <span
          className={`truncate max-w-[130px] sm:max-w-[180px] font-medium ${
            isCameraEnabled ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          {displayName}
        </span>
        {isLocal && (
          <span
            className={`text-[11px] font-normal shrink-0 ${
              isCameraEnabled ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            (Bạn)
          </span>
        )}
        <span
          className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full ml-0.5 ${
            isMicEnabled
              ? isCameraEnabled
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-emerald-50 text-emerald-600'
              : isCameraEnabled
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isMicEnabled ? (
            <Mic className="w-3 h-3" />
          ) : (
            <MicOff className="w-3 h-3" />
          )}
        </span>
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
