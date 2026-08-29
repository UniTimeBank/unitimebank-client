import React, { useEffect, useRef, useState } from 'react';
import { Participant, Track, LocalParticipant, RemoteParticipant, ParticipantEvent } from 'livekit-client';
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

  // Dynamic state reactive to LiveKit events
  const [isCameraEnabled, setIsCameraEnabled] = useState(participant.isCameraEnabled);
  const [isMicEnabled, setIsMicEnabled] = useState(participant.isMicrophoneEnabled);
  const [videoTrack, setVideoTrack] = useState<Track | null>(() => {
    return participant.getTrackPublication(Track.Source.Camera)?.track || null;
  });
  
  const rawName = participant.name || participant.identity;
  const isGenericMentor = !rawName || rawName.trim().toLowerCase() === 'mentor';
  const displayName = isGenericMentor ? (isLocal ? 'Tôi' : (isHost ? 'Host' : 'Thành viên')) : rawName;

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
        /* Avatar Placeholder when Camera is OFF */
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-50 text-primary-700 font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-xs border-4 border-primary-100/90">
            {(isHost && displayName === 'Host' ? 'H' : displayName.charAt(0)).toUpperCase()}
          </div>
          <div className="mt-3.5 flex items-center justify-center gap-1.5 flex-wrap">
            {isHost ? (
              <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary-200 flex items-center gap-1">
                <Crown className="w-3 h-3 text-primary-600" /> Host
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                Học viên
              </span>
            )}
            {displayName !== 'Host' && displayName !== 'Học viên' && displayName !== 'Tôi' && (
              <span className="text-slate-800 font-bold text-sm md:text-base">
                {displayName}
              </span>
            )}
            {isLocal && (
              <span className="text-[11px] text-primary-700 font-bold bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                Tôi
              </span>
            )}
          </div>
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
        {isHost ? (
          <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary-200 shrink-0">
            <Crown className="w-3 h-3 text-primary-600" /> Host
          </span>
        ) : (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
            Học viên
          </span>
        )}
        {displayName !== 'Host' && displayName !== 'Học viên' && displayName !== 'Tôi' && (
          <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[160px]">
            {displayName}
          </span>
        )}
        {isLocal && (
          <span className="text-xs font-bold text-slate-500 truncate">
            (Tôi)
          </span>
        )}
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
