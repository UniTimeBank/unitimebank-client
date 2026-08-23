import React, { useRef, useEffect, useMemo } from 'react';
import {
  Track,
  RemoteParticipant,
  LocalParticipant,
} from 'livekit-client';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  Settings,
  PhoneOff,
  Sparkles,
  Flag,
} from 'lucide-react';
import { toast } from '@/shared/utils';

interface OneOnOneSpotlightVideoProps {
  localParticipant?: LocalParticipant | null;
  remoteParticipant?: RemoteParticipant;
  remoteName?: string;
  remoteAvatar?: string;
  localName?: string;
  localAvatar?: string;
  screenShareTrack?: {
    participantIdentity: string;
    track: Track;
  } | null;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
  onReport?: () => void;
  onLeave: () => void;
}

export const OneOnOneSpotlightVideo: React.FC<OneOnOneSpotlightVideoProps> = ({
  localParticipant,
  remoteParticipant,
  remoteName = 'Gia sư / Học viên',
  remoteAvatar,
  localName = 'Bạn',
  localAvatar,
  screenShareTrack,
  isMicEnabled,
  isCameraEnabled,
  isScreenSharing,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onOpenSettings,
  onReport,
  onLeave,
}) => {
  const spotlightVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const isLocalCameraOn = localParticipant?.isCameraEnabled ?? isCameraEnabled;
  const isRemoteSpeaking = remoteParticipant?.isSpeaking;

  // 1. Determine active track to display in main spotlight stage
  const activeSpotlight = useMemo(() => {
    // Priority A: Remote Screen Share
    const remoteScreenPub = remoteParticipant?.getTrackPublication(Track.Source.ScreenShare);
    if (remoteScreenPub?.track) {
      return {
        track: remoteScreenPub.track,
        isScreenShare: true,
        sharerName: remoteName,
      };
    }

    // Priority B: Local Screen Share
    if (isScreenSharing) {
      const localScreenPub = localParticipant?.getTrackPublication(Track.Source.ScreenShare);
      const localTrack = localScreenPub?.track || screenShareTrack?.track;
      if (localTrack) {
        return {
          track: localTrack,
          isScreenShare: true,
          sharerName: 'Bạn',
        };
      }
    }

    // Priority C: Remote Screen Share from general screenShareTrack
    if (screenShareTrack?.track) {
      return {
        track: screenShareTrack.track,
        isScreenShare: true,
        sharerName:
          screenShareTrack.participantIdentity === localParticipant?.identity
            ? 'Bạn'
            : remoteName,
      };
    }

    // Priority D: Remote Camera
    const remoteCamPub = remoteParticipant?.getTrackPublication(Track.Source.Camera);
    if (remoteParticipant?.isCameraEnabled && remoteCamPub?.track) {
      return {
        track: remoteCamPub.track,
        isScreenShare: false,
        sharerName: remoteName,
      };
    }

    return null;
  }, [
    remoteParticipant,
    localParticipant,
    isScreenSharing,
    screenShareTrack,
    remoteName,
  ]);

  // 2. Attach Active Spotlight Track
  useEffect(() => {
    const videoElement = spotlightVideoRef.current;
    if (!videoElement) return;

    if (activeSpotlight?.track) {
      activeSpotlight.track.attach(videoElement);
    }

    return () => {
      if (activeSpotlight?.track) {
        activeSpotlight.track.detach(videoElement);
      }
    };
  }, [activeSpotlight]);

  // 3. Attach Local Camera Track (for top-right PiP tile)
  useEffect(() => {
    const videoElement = localVideoRef.current;
    if (!videoElement || !localParticipant) return;

    const cameraPub = localParticipant.getTrackPublication(Track.Source.Camera);
    const track = cameraPub?.track;

    if (track && isLocalCameraOn) {
      track.attach(videoElement);
    }

    return () => {
      if (track) {
        track.detach(videoElement);
      }
    };
  }, [localParticipant, isLocalCameraOn]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-sm bg-slate-900 border border-slate-200 flex items-center justify-center select-none group">
      {/* 1. Active Spotlight Video (Camera or Screen Share) */}
      {activeSpotlight ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={spotlightVideoRef}
            className={`w-full h-full ${
              activeSpotlight.isScreenShare ? 'object-contain' : 'object-cover'
            }`}
            autoPlay
            playsInline
          />

          {/* Screen Share Indicator Badge */}
          {activeSpotlight.isScreenShare && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 z-10 shadow-lg">
              <Monitor className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Đang chia sẻ màn hình ({activeSpotlight.sharerName})</span>
            </div>
          )}
        </div>
      ) : (
        /* Placeholder / Avatar (When no camera & no screen share) */
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="relative">
            {remoteAvatar ? (
              <img
                src={remoteAvatar}
                alt={remoteName}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-700 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-slate-800 text-slate-300 font-extrabold text-3xl flex items-center justify-center border-4 border-slate-700 shadow-xl">
                {remoteName.charAt(0).toUpperCase()}
              </div>
            )}
            {isRemoteSpeaking && (
              <span className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">{remoteName}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {remoteParticipant ? '' : 'Đang chờ đối phương tham gia...'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Top-Right Picture-in-Picture (PiP) Tile: Local User */}
      <div className="absolute top-4 right-4 w-44 sm:w-52 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-800 z-10 flex items-center justify-center">
        {isLocalCameraOn && localParticipant ? (
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover scale-x-[-1]"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
            {localAvatar ? (
              <img
                src={localAvatar}
                alt={localName}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center border-2 border-indigo-400 shadow-md">
                {localName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Local Name Badge */}
        <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white/90 flex items-center gap-1">
          <span>You ({localName})</span>
          {!isMicEnabled && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
        </div>
      </div>

      {/* 3. Bottom Video Floating Control Bar (Modern Dock) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300">
        <div className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl">
          {/* 1. Microphone Toggle */}
          <button
            type="button"
            onClick={onToggleMic}
            title={isMicEnabled ? 'Tắt Micro' : 'Bật Micro'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
              isMicEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* 2. Camera Toggle */}
          <button
            type="button"
            onClick={onToggleCamera}
            title={isCameraEnabled ? 'Tắt Camera' : 'Bật Camera'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
              isCameraEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {isCameraEnabled ? (
              <VideoIcon className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {/* 3. Screen Share Toggle */}
          <button
            type="button"
            onClick={onToggleScreenShare}
            title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
              isScreenSharing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* 4. Settings Toggle */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Cài đặt thiết bị"
            className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* 5. Report / Báo cáo sự cố Toggle */}
          <button
            type="button"
            onClick={
              onReport ||
              (() =>
                toast.info(
                  'Tính năng báo cáo sự cố buổi học đang được phát triển.',
                ))
            }
            title="Báo cáo sự cố / vi phạm"
            className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Flag className="w-5 h-5" />
          </button>

          {/* 6. End / Leave Session Button */}
          <button
            type="button"
            onClick={onLeave}
            title="Rời phòng học"
            className="h-11 w-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex justify-center items-center gap-2 transition-all duration-200 cursor-pointer shadow-md active:scale-95 ml-1"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default OneOnOneSpotlightVideo;
