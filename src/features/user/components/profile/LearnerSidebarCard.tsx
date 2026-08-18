import React from 'react';
import { BookOpen, CheckCircle2, Clock, Sparkles, Send, Target } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';

interface LearnerSidebarCardProps {
  learnerName: string;
}

export const LearnerSidebarCard: React.FC<LearnerSidebarCardProps> = ({
  learnerName,
}) => {
  const handleOfferTeaching = () => {
    toast.success(
      'Đã gửi lời mời hướng dẫn!',
      `Bạn đã gửi đề nghị hỗ trợ học tập đến ${learnerName}.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Learning Requests Active Card */}
      <div className="bg-[#1E293B] text-white rounded-3xl shadow-xs overflow-hidden">
        {/* Dark Top Header */}
        <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yêu cầu học tập đang mở</span>
            </span>
            <div className="text-base font-bold mt-1 text-white">
              Cần tìm người hướng dẫn
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-400/30">
            1 credit / phút
          </span>
        </div>

        {/* Request Details */}
        <div className="p-5 bg-white text-gray-900 space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900">
                📚 Ôn tập Cấu trúc dữ liệu & Thuật toán C++
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                60 phút
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              "Em cần người giải đáp và hướng dẫn code cây nhị phân (Binary Tree) và đồ thị cơ bản trước kỳ thi giữa kỳ."
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Thứ 3 & Thứ 5 (Tối)</span>
              </span>
              <span>•</span>
              <span className="font-bold text-slate-700">Sẵn sàng trả 60 Credit</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            type="button"
            variant="primary"
            fullWidth
            size="md"
            onClick={handleOfferTeaching}
            className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs py-3 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Đề nghị hướng dẫn {learnerName}</span>
          </Button>
        </div>
      </div>

      {/* 2. Learner Reputation & Commitment Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4.5 h-4.5 text-primary-700" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Cam kết học tập của {learnerName}
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đúng giờ & chuẩn bị trước câu hỏi</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tỷ lệ hoàn thành buổi học 100%</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ký quỹ Credit tự động bảo đảm an toàn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
