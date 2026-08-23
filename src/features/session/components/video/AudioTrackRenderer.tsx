import React, { useEffect, useRef } from 'react';
import { RemoteParticipant, Track } from 'livekit-client';

interface AudioTrackRendererProps {
  participant: RemoteParticipant;
}

export const AudioTrackRenderer: React.FC<AudioTrackRendererProps> = ({ participant }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const audioPub = participant.getTrackPublication(Track.Source.Microphone);
    const audioTrack = audioPub?.track;

    if (audioTrack && participant.isMicrophoneEnabled) {
      audioTrack.attach(audioElement);
    }

    return () => {
      if (audioTrack) {
        audioTrack.detach(audioElement);
      }
    };
  }, [participant, participant.isMicrophoneEnabled]);

  return <audio ref={audioRef} autoPlay playsInline />;
};
