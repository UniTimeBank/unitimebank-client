import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Coins, Clock, ArrowRight } from 'lucide-react';

interface SessionEndedModalProps {
  isOpen: boolean;
  creditsTransferred?: number;
  durationFormatted?: string;
  isHost?: boolean;
}

export const SessionEndedModal: React.FC<SessionEndedModalProps> = ({
  isOpen,
  creditsTransferred = 0,
  durationFormatted = '00:00',
  isHost = false,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-100">Buổi học đã kết thúc!</h3>
        <p className="text-sm text-slate-400 mt-2">
          Cảm ơn bạn đã tham gia buổi học và chia sẻ tri thức cùng cộng đồng UniTimeBank.
        </p>

        {/* Stats */}
        <div className="my-6 grid grid-cols-2 gap-3">
          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Thời gian học</span>
            </div>
            <p className="text-base font-bold text-slate-100">{durationFormatted}</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHost ? 'Credits nhận được' : 'Credits giải ngân'}</span>
            </div>
            <p className="text-base font-bold text-emerald-400">+{creditsTransferred} Credits</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/manage/bookings')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <span>Quay lại trang Đặt lịch</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
