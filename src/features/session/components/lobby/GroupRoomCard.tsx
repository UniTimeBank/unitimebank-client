import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Radio, ArrowRight, BookOpen } from 'lucide-react';
import type { ActiveGroupRoomItem } from '../../types';

interface GroupRoomCardProps {
  room: ActiveGroupRoomItem;
}

export const GroupRoomCard: React.FC<GroupRoomCardProps> = ({ room }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Đang mở
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" /> {room.currentParticipants} người học
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {room.title}
        </h3>

        {room.category && (
          <p className="text-xs text-indigo-400/90 font-medium mt-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {room.category}
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Phí: <strong className="text-amber-400">1 Credit/phút</strong>
        </div>
        <button
          onClick={() => navigate(`/rooms/group/${room.roomId}`)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
        >
          <span>Tham gia</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
