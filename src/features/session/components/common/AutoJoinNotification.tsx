import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, X } from 'lucide-react';

interface AutoJoinNotificationProps {
  isOpen: boolean;
  bookingId: string;
  bookingTitle?: string;
  mentorName?: string;
  onClose: () => void;
}

export const AutoJoinNotification: React.FC<AutoJoinNotificationProps> = ({
  isOpen,
  bookingId,
  bookingTitle,
  mentorName,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoin = () => {
    onClose();
    navigate(`/rooms/one-on-one/${bookingId}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 flex items-start gap-3.5">
        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 flex-shrink-0 animate-pulse">
          <Video className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Buổi học đã bắt đầu
            </span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-semibold text-slate-100 mt-1 truncate">
            {bookingTitle || 'Buổi học trực tuyến 1:1'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {mentorName ? `Mentor: ${mentorName}` : 'Phòng học đã sẵn sàng để tham gia.'}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleJoin}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Vào phòng học ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
