import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const LeaderboardTrustScoreCallout: React.FC = () => {
  return (
    <div className="bg-emerald-50/70 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Điểm Uy Tín (Trust Score) Tối Đa 100 & Độc Lập
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
            Điểm Uy Tín được khởi tạo mặc định là <strong>100 điểm</strong> cho mỗi vai trò (Gia Sư & Học Viên) và chỉ bị trừ khi phát sinh vi phạm quy chế (vắng mặt không lý do, hủy lịch gấp, đánh giá 1 sao do lỗi chất lượng). Điểm Xếp Hạng thành tích là chỉ số tích lũy độc lập nhằm tạo động lực phát triển kỹ năng.
          </p>
        </div>
      </div>
      <Link
        to="/profile"
        className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100/60 transition-all shrink-0 shadow-2xs"
      >
        Xem Điểm Của Tôi
      </Link>
    </div>
  );
};
