import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const hasLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasLength) score += 1;
  if (password.length >= 12) score += 1;
  if (hasUpperLower) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  const getStrengthMeta = (s: number) => {
    if (s <= 1) return { label: 'Rất yếu', color: 'bg-red-500', text: 'text-red-600', percent: 20 };
    if (s === 2) return { label: 'Yếu', color: 'bg-orange-500', text: 'text-orange-600', percent: 40 };
    if (s === 3) return { label: 'Trung bình', color: 'bg-yellow-500', text: 'text-yellow-600', percent: 60 };
    if (s === 4) return { label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-600', percent: 80 };
    return { label: 'Rất mạnh', color: 'bg-teal-500', text: 'text-teal-600', percent: 100 };
  };

  const meta = getStrengthMeta(score);

  return (
    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Độ mạnh mật khẩu:</span>
        <span className={`font-bold ${meta.text}`}>{meta.label}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${meta.color} transition-all duration-300 rounded-full`}
          style={{ width: `${meta.percent}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
          {hasLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Tối thiểu 8 ký tự</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasUpperLower ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
          {hasUpperLower ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Chữ hoa & chữ thường</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
          {hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Chứa ít nhất 1 chữ số</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
          {hasSpecial ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
          <span>Ký tự đặc biệt (!@#$)</span>
        </div>
      </div>
    </div>
  );
};
