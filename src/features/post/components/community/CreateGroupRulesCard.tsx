import React from 'react';
import { X } from 'lucide-react';

interface CreateGroupRulesCardProps {
  rules: string[];
  newRule: string;
  onNewRuleChange: (val: string) => void;
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
}

export const CreateGroupRulesCard: React.FC<CreateGroupRulesCardProps> = ({
  rules,
  newRule,
  onNewRuleChange,
  onAddRule,
  onRemoveRule,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900">3. Quy tắc cộng đồng của nhóm</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Đặt ra các quy tắc để duy trì môi trường trao đổi học thuật văn minh
        </p>
      </div>

      <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 text-xs bg-white px-4 py-2.5 rounded-xl border border-gray-100 text-gray-700 font-medium"
          >
            <span className="truncate">
              {idx + 1}. {rule}
            </span>
            <button
              type="button"
              onClick={() => onRemoveRule(idx)}
              className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
              title="Xóa quy tắc"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => onNewRuleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddRule();
              }
            }}
            placeholder="Thêm quy tắc mới và bấm Thêm..."
            className="flex-1 px-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-medium"
          />
          <button
            type="button"
            onClick={onAddRule}
            className="px-4 py-2 text-xs font-bold bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-xl transition-colors cursor-pointer"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};
