import React, { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';
import { Monitor } from 'lucide-react';

interface ScreenShareViewProps {
  screenTrack: Track | null;
  participantIdentity: string;
}

export const ScreenShareView: React.FC<ScreenShareViewProps> = ({
  screenTrack,
  participantIdentity,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !screenTrack) return;

    screenTrack.attach(videoElement);

    return () => {
      screenTrack.detach(videoElement);
    };
  }, [screenTrack]);

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
      />
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg flex items-center gap-2">
        <Monitor className="w-4 h-4 text-indigo-400" />
        <span className="text-xs text-slate-200 font-medium">
          Màn hình chia sẻ từ: <strong className="text-white">{participantIdentity}</strong>
        </span>
      </div>
    </div>
  );
};
