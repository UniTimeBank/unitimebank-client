import React from 'react';
import { Laptop, LogOut } from 'lucide-react';

interface ActiveSessionCardProps {
  onLogout: () => void;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ onLogout }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Laptop className="w-4 h-4 text-slate-600" />
        Phiên Đăng nhập Hiện tại
      </h3>

      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Laptop className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Trình duyệt Web</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang trực tuyến (Thiết bị này)
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};
