import React from 'react';
import { LocalParticipant, RemoteParticipant } from 'livekit-client';
import { ParticipantTile } from './ParticipantTile';
import { AudioTrackRenderer } from './AudioTrackRenderer';

interface VideoGridProps {
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  activeSpeakers: string[];
  mentorId?: string;
  currentUserId?: string;
  is1on1?: boolean;
  onMuteParticipant?: (id: string) => void;
  onKickParticipant?: (id: string) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localParticipant,
  remoteParticipants,
  activeSpeakers,
  mentorId,
  currentUserId,
  is1on1 = false,
  onMuteParticipant,
  onKickParticipant,
}) => {
  const isHost = mentorId && currentUserId ? mentorId === currentUserId : false;
  const totalCount = (localParticipant ? 1 : 0) + remoteParticipants.length;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-3 md:p-4 gap-4">
      {/* Audio renderers for remote streams */}
      {remoteParticipants.map((p) => (
        <AudioTrackRenderer key={p.identity} participant={p} />
      ))}

      {is1on1 ? (
        /* 1:1 Layout: 2 equal cards or Side-by-Side */
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
          {localParticipant && (
            <div className="w-full h-full min-h-[220px]">
              <ParticipantTile
                participant={localParticipant}
                isLocal
                isSpeaking={activeSpeakers.includes(localParticipant.identity)}
                isHost={mentorId === currentUserId}
              />
            </div>
          )}

          {remoteParticipants.length > 0 ? (
            <div className="w-full h-full min-h-[220px]">
              <ParticipantTile
                participant={remoteParticipants[0]}
                isSpeaking={activeSpeakers.includes(remoteParticipants[0].identity)}
                isHost={mentorId === remoteParticipants[0].identity}
                canModerate={isHost}
                onMute={() => onMuteParticipant && onMuteParticipant(remoteParticipants[0].identity)}
                onKick={() => onKickParticipant && onKickParticipant(remoteParticipants[0].identity)}
              />
            </div>
          ) : (
            /* Waiting placeholder when counterpart hasn't joined */
            <div className="w-full h-full min-h-[220px] bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3 animate-pulse">
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-slate-300 font-medium text-sm md:text-base">
                Đang chờ người cùng học tham gia...
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Khi đối phương bấm vào phòng, hình ảnh và âm thanh sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Group Room Layout (Responsive Grid) */
        <div
          className={`w-full h-full grid gap-4 max-w-7xl mx-auto ${
            totalCount <= 2
              ? 'grid-cols-1 md:grid-cols-2'
              : totalCount <= 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3'
          }`}
        >
          {localParticipant && (
            <div className="w-full h-full min-h-[180px]">
              <ParticipantTile
                participant={localParticipant}
                isLocal
                isSpeaking={activeSpeakers.includes(localParticipant.identity)}
                isHost={mentorId === currentUserId}
              />
            </div>
          )}

          {remoteParticipants.map((p) => (
            <div key={p.identity} className="w-full h-full min-h-[180px]">
              <ParticipantTile
                participant={p}
                isSpeaking={activeSpeakers.includes(p.identity)}
                isHost={mentorId === p.identity}
                canModerate={isHost}
                onMute={() => onMuteParticipant && onMuteParticipant(p.identity)}
                onKick={() => onKickParticipant && onKickParticipant(p.identity)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
