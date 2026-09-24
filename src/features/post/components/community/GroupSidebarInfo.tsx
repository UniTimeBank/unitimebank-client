import React from 'react';
import { BookOpen, ShieldCheck, Sparkles } from 'lucide-react';
import type { CommunityGroup } from '@/features/post/types';
import { DEFAULT_GROUP_RULES } from '@/features/post/constants';

interface GroupSidebarInfoProps {
  group: CommunityGroup;
}

export const GroupSidebarInfo: React.FC<GroupSidebarInfoProps> = ({ group }) => {
  const rules =
    group.rules && group.rules.length > 0 ? group.rules : DEFAULT_GROUP_RULES;

  return (
    <div className="space-y-6">
      {/* Giới thiệu nhóm */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-600" />
          <span>Giới thiệu nhóm</span>
        </h3>

        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          {group.description}
        </p>

        <div className="pt-3 border-t border-gray-50 space-y-2 text-xs text-gray-500 font-medium">
          <div className="flex items-center justify-between">
            <span>Chuyên ngành:</span>
            <span className="font-bold text-gray-800">{group.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Quyền riêng tư:</span>
            <span className="font-bold text-emerald-600">Công khai (Tất cả sinh viên)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Quản trị viên:</span>
            <span className="font-bold text-gray-800">{group.creatorName}</span>
          </div>
        </div>
      </div>

      {/* Quy tắc nhóm */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Quy tắc cộng đồng</span>
        </h3>

        <div className="space-y-2.5">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-600">
              <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                {idx + 1}
              </div>
              <span className="leading-relaxed font-medium">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UniTime Group Tip */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B2E22] via-[#134434] to-[#1A5743] border border-emerald-900/40 rounded-3xl p-5 text-white shadow-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Mẹo học tập UniTime</span>
        </div>
        <p className="text-[11px] text-emerald-100/80 leading-relaxed font-normal">
          Hãy tận dụng chức năng tìm bạn cùng học hoặc mở phòng học nhóm trực tuyến để cùng nhau giải quyết bài tập lớn hiệu quả nhé!
        </p>
      </div>
    </div>
  );
};
