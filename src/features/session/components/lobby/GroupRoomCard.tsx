import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, BookOpen, LogOut, Loader2 } from 'lucide-react';
import type { ActiveGroupRoomItem } from '../../types';

interface GroupRoomCardProps {
  room: ActiveGroupRoomItem;
  currentUserId?: string;
  onCloseRoom?: (roomId: string) => void;
  isClosing?: boolean;
}

export const GroupRoomCard: React.FC<GroupRoomCardProps> = ({
  room,
  currentUserId,
  onCloseRoom,
  isClosing = false,
}) => {
  const navigate = useNavigate();
  const isHost = Boolean(currentUserId && room.mentorId && String(currentUserId) === String(room.mentorId));

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all flex flex-col justify-between hover:shadow-xs">
      <div>
        {/* Header Status & Participants */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Đang mở</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/50">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{room.currentParticipants} người học</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 leading-snug">
          {room.title}
        </h3>

        {/* Category Tag */}
        {room.category && (
          <p className="text-[11px] text-slate-600 font-medium mt-2 flex items-center gap-1 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md w-fit">
            <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{room.category}</span>
          </p>
        )}
      </div>

      {/* Footer / Action */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 font-medium">
          Phí: <span className="text-slate-800 font-bold">1 Credit/phút</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Đóng phòng (Nếu là Host hoặc có handler onCloseRoom) */}
          {(isHost || onCloseRoom) && (
            <button
              type="button"
              disabled={isClosing}
              onClick={() => onCloseRoom && onCloseRoom(room.roomId)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors border border-rose-200/60 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isClosing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <LogOut className="w-3 h-3" />
              )}
              <span>Đóng phòng</span>
            </button>
          )}

          {/* Nút Tham gia */}
          <button
            type="button"
            onClick={() => navigate(`/rooms/group/${room.roomId}`)}
            className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Tham gia</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
